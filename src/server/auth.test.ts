import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/client", () => ({ db: {} }));

// Hashes below were generated with bcryptjs 2.4.3 at cost 12, i.e. exactly what
// hashPassword() stored in admin_users.password_hash before the bcryptjs 3 upgrade.
const PASSWORD = "correct horse battery staple";
const LEGACY_2A = "$2a$12$E4ppfbLp3vVQkw/yo4YRBe/PQd8CirjGZgg6OknLksbBv32J9dbaO";
// Same digest with the $2b$ prefix written by OpenBSD-style implementations.
const LEGACY_2B = "$2b$12$9h6aI4KexWKtECqX2qgNvOwdR3JvfVqXo2/xfW.1x6AIHfQ2Ivm.e";
const UNICODE_PASSWORD = "Ünïcödé pässwörd 🔐 long-enough";
const LEGACY_UNICODE = "$2a$12$aCTnfwQQmrO9CtOaQPxGI.htjG15e5eMfpIN69jTpP67uDGKm13ai";
// bcrypt only uses the first 72 bytes; a longer password hashed by 2.4.3 must keep that behaviour.
const LONG_PASSWORD = `${"x".repeat(80)}-tail-beyond-72-bytes`;
const LEGACY_LONG = "$2a$12$yZpfGAiP.3ja8cr9AyRMNux7XucQZ9ifa6SpINtVQeagkdeFImKn2";

describe("password hashing", () => {
  it("verifies $2a$ and $2b$ cost-12 hashes created by bcryptjs 2.4.3", async () => {
    const { verifyPassword } = await import("@/server/auth");
    expect(await verifyPassword(PASSWORD, LEGACY_2A)).toBe(true);
    expect(await verifyPassword(PASSWORD, LEGACY_2B)).toBe(true);
    expect(await verifyPassword(UNICODE_PASSWORD, LEGACY_UNICODE)).toBe(true);
    expect(await verifyPassword(LONG_PASSWORD, LEGACY_LONG)).toBe(true);
    expect(await verifyPassword("x".repeat(72), LEGACY_LONG)).toBe(true);
  });

  it("rejects wrong passwords against legacy hashes", async () => {
    const { verifyPassword } = await import("@/server/auth");
    expect(await verifyPassword(`${PASSWORD}!`, LEGACY_2A)).toBe(false);
    expect(await verifyPassword("", LEGACY_2B)).toBe(false);
  });

  it("hashes new passwords at cost 12 and verifies them", async () => {
    const { hashPassword, verifyPassword } = await import("@/server/auth");
    const hash = await hashPassword(PASSWORD);
    expect(hash).toMatch(/^\$2[ab]\$12\$[./A-Za-z0-9]{53}$/);
    expect(await verifyPassword(PASSWORD, hash)).toBe(true);
    expect(await verifyPassword("wrong password!", hash)).toBe(false);
  });
});
