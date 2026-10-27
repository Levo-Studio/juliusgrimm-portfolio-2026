// @vitest-environment node
import { createHash } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGuardrails, generateSync } from "otplib";

// Auth and session behaviour of the admin server actions, run against the real auth module
// with the database, cookies and request headers replaced by in-memory fakes. drizzle's
// condition builders are swapped for plain objects so the WHERE clauses can be asserted.

const state = vi.hoisted(() => {
  process.env.DATABASE_URL ??= "postgresql://build:build@localhost:5432/build";
  return {
    jar: new Map<string, string>(),
    headers: new Headers(),
    selects: [] as unknown[][],
    updates: [] as { table: unknown; set: Record<string, unknown>; where: unknown }[]
  };
});

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  const name = (column: unknown): string => (column as { name: string }).name;
  return {
    ...actual,
    and: (...conditions: unknown[]) => ({ and: conditions }),
    eq: (column: unknown, value: unknown) => ({ eq: [name(column), value] }),
    ne: (column: unknown, value: unknown) => ({ ne: [name(column), value] }),
    isNull: (column: unknown) => ({ isNull: name(column) })
  };
});

vi.mock("@/server/db/client", () => {
  const chain = (result: unknown): Record<string, unknown> => {
    const link: Record<string, unknown> = {};
    for (const method of ["from", "where", "limit", "orderBy", "returning"]) link[method] = () => link;
    link.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
    return link;
  };
  return {
    db: {
      select: () => chain(state.selects.shift() ?? []),
      insert: () => ({ values: () => chain([]) }),
      delete: () => ({ where: async () => undefined }),
      update: (table: unknown) => ({
        set: (set: Record<string, unknown>) => ({
          where: async (where: unknown) => {
            state.updates.push({ table, set, where });
          }
        })
      })
    }
  };
});

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (state.jar.has(name) ? { name, value: state.jar.get(name) } : undefined),
    set: (name: string, value: string) => void state.jar.set(name, value),
    delete: (name: string) => void state.jar.delete(name)
  }),
  headers: async () => state.headers
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { adminSessions, adminUsers } = await import("@/server/db/schema");
const { changePassword, loginAdmin, logoutAdmin, revokeSession, verifyTwoFactorLogin } = await import("@/app/admin/actions");
const { createPendingTwoFactor, hashPassword, LOGIN_ATTEMPTS_PER_CLIENT, LOGIN_ATTEMPTS_PER_EMAIL, TWO_FACTOR_ATTEMPTS_PER_USER } = await import("@/server/auth");
const { generateTotpSecret } = await import("@/server/totp");

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");
const form = (fields: Record<string, string>): FormData => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

const USER = { id: "1c0f3a52-0d8e-4c55-9d43-0b8f0c3f5a10", email: "owner@example.com" };
const SESSION_TOKEN = "current-session-token";
const CSRF = "csrf-token";

/** Queues what getSessionUser() reads for a valid session of USER. */
const signedIn = (): void => {
  state.jar.set("admin_session", SESSION_TOKEN);
  state.jar.set("admin_csrf", CSRF);
  state.selects.push([{ id: "a7f1c2d4-5e6f-4a1b-8c9d-0e1f2a3b4c5d", userId: USER.id, expiresAt: new Date(Date.now() + 60_000) }], [USER]);
};

beforeEach(() => {
  state.jar.clear();
  state.headers = new Headers();
  state.selects.length = 0;
  state.updates.length = 0;
});

describe("2FA sign-in attempts", () => {
  const totp = (secret: string): string => generateSync({ secret, guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }) });
  const wrongCode = (secret: string): string => String((Number(totp(secret)) + 1) % 1_000_000).padStart(6, "0");

  it(`locks a pending user out after ${TWO_FACTOR_ATTEMPTS_PER_USER} codes and clears the pending cookie`, async () => {
    const userId = "6b1e0c8a-2f4d-4e7a-9b3c-1d2e3f4a5b6c";
    const secret = generateTotpSecret();
    await createPendingTwoFactor(userId);

    for (let i = 0; i < TWO_FACTOR_ATTEMPTS_PER_USER; i += 1) {
      state.selects.push([{ userId, secretEncrypted: secret }]);
      expect(await verifyTwoFactorLogin({ ok: false }, form({ code: wrongCode(secret) }))).toEqual({ ok: false, error: "Invalid 2FA code." });
    }

    state.selects.push([{ userId, secretEncrypted: secret }]);
    const locked = await verifyTwoFactorLogin({ ok: false }, form({ code: wrongCode(secret) }));
    expect(locked.error).toMatch(/Too many 2FA attempts/);
    expect(state.jar.has("admin_2fa_pending")).toBe(false);

    // Signing in with the password again issues a new pending cookie but not new attempts.
    await createPendingTwoFactor(userId);
    state.selects.push([{ userId, secretEncrypted: secret }]);
    const retried = await verifyTwoFactorLogin({ ok: false }, form({ code: totp(secret) }));
    expect(retried.error).toMatch(/Too many 2FA attempts/);
    expect(state.jar.has("admin_session")).toBe(false);
  });

  it("does not count other users against the limit", async () => {
    const secret = generateTotpSecret();
    await createPendingTwoFactor("0d9c8b7a-6f5e-4d3c-2b1a-0f9e8d7c6b5a");
    state.selects.push([{ secretEncrypted: secret }]);
    await expect(verifyTwoFactorLogin({ ok: false }, form({ code: totp(secret) }))).rejects.toThrow(/NEXT_REDIRECT/);
    expect(state.jar.has("admin_session")).toBe(true);
  });
});

describe("password sign-in limits", () => {
  const attempt = async (email: string, ip: string) => {
    state.headers = new Headers({ "x-forwarded-for": ip });
    state.selects.push([{ totalUsers: 1 }], []);
    return loginAdmin({ ok: false }, form({ email, password: "a wrong but long password" }));
  };

  it(`blocks one client after ${LOGIN_ATTEMPTS_PER_CLIENT} attempts for an email`, async () => {
    for (let i = 0; i < LOGIN_ATTEMPTS_PER_CLIENT; i += 1) expect((await attempt("client@example.com", "198.51.100.1")).error).toBe("Invalid credentials.");
    expect((await attempt("client@example.com", "198.51.100.1")).error).toMatch(/Too many login attempts/);
  });

  it(`blocks an email after ${LOGIN_ATTEMPTS_PER_EMAIL} attempts spread over many clients`, async () => {
    for (let i = 0; i < LOGIN_ATTEMPTS_PER_EMAIL; i += 1) expect((await attempt("spread@example.com", `203.0.113.${i}`)).error).toBe("Invalid credentials.");
    expect((await attempt("spread@example.com", "203.0.113.250")).error).toMatch(/Too many login attempts/);
    // Other accounts are unaffected.
    expect((await attempt("other@example.com", "203.0.113.250")).error).toBe("Invalid credentials.");
  });
});

describe("sessions", () => {
  it("logout revokes the current session row, not only the cookie", async () => {
    signedIn();
    await expect(logoutAdmin()).rejects.toThrow(/NEXT_REDIRECT/);

    expect(state.jar.has("admin_session")).toBe(false);
    const revoke = state.updates.find((update) => update.table === adminSessions);
    expect(revoke?.set.revokedAt).toBeInstanceOf(Date);
    expect(revoke?.where).toEqual({ and: [{ eq: ["token_hash", sha256(SESSION_TOKEN)] }, { isNull: "revoked_at" }] });
  });

  it("revoking a session is scoped to the signed-in user's sessions", async () => {
    signedIn();
    const sessionId = "9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b";
    await revokeSession(form({ csrf: CSRF, sessionId }));

    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].table).toBe(adminSessions);
    expect(state.updates[0].where).toEqual({
      and: [{ eq: ["id", sessionId] }, { eq: ["user_id", USER.id] }, { isNull: "revoked_at" }]
    });
  });

  it("changing the password revokes every other session of the user", async () => {
    const current = "the current long password";
    signedIn();
    state.selects.push([{ ...USER, passwordHash: await hashPassword(current) }]);

    const result = await changePassword(
      { ok: false },
      form({ csrf: CSRF, currentPassword: current, newPassword: "a brand new long password", confirmPassword: "a brand new long password" })
    );

    expect(result).toEqual({ ok: true, message: "Password updated." });
    expect(state.updates.map((update) => update.table)).toEqual([adminUsers, adminSessions]);
    expect(state.updates[1].where).toEqual({
      and: [{ eq: ["user_id", USER.id] }, { isNull: "revoked_at" }, { ne: ["token_hash", sha256(SESSION_TOKEN)] }]
    });
  }, 15_000);
});
