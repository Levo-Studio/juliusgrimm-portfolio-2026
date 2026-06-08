import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminSessions, adminUsers, auditLogs } from "@/server/db/schema";

const SESSION_COOKIE = "admin_session";
const CSRF_COOKIE = "admin_csrf";
const TWO_FACTOR_COOKIE = "admin_2fa_pending";
const sessionMs = 1000 * 60 * 60 * 24 * 7;
const attempts = new Map<string, { count: number; until: number }>();
const isProd = process.env.NODE_ENV === "production";

const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const rateLimitAuth = (identifier: string): boolean => {
  const now = Date.now();
  const state = attempts.get(identifier);
  if (!state || state.until < now) {
    attempts.set(identifier, { count: 1, until: now + 10 * 60 * 1000 });
    return true;
  }
  if (state.count >= 10) return false;
  attempts.set(identifier, { ...state, count: state.count + 1 });
  return true;
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);

export const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 12);

export const createSession = async (userId: string): Promise<void> => {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + sessionMs);

  const headerBag = await headers();
  await db.insert(adminSessions).values({
    userId,
    tokenHash,
    expiresAt,
    userAgent: headerBag.get("user-agent"),
    ipAddress: headerBag.get("x-forwarded-for")
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, secure: isProd, sameSite: "lax", expires: expiresAt, path: "/" });
};

export const getSessionUser = async (): Promise<{ id: string; email: string } | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);
  const [session] = await db
    .select({ id: adminSessions.id, userId: adminSessions.userId, expiresAt: adminSessions.expiresAt })
    .from(adminSessions)
    .where(and(eq(adminSessions.tokenHash, tokenHash), isNull(adminSessions.revokedAt)));

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.update(adminSessions).set({ revokedAt: new Date() }).where(eq(adminSessions.id, session.id));
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
  const [user] = await db.select({ id: adminUsers.id, email: adminUsers.email }).from(adminUsers).where(eq(adminUsers.id, session.userId)).limit(1);
  return user ?? null;
};

export const clearSession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
};

const signingKey = (): Buffer => {
  const base = process.env.DATABASE_URL ?? process.env.AUTH_URL ?? "fallback-signing-key";
  return createHash("sha256").update(base).digest();
};

const signPendingPayload = (payload: string): string =>
  createHmac("sha256", signingKey()).update(payload).digest("hex");

export const createPendingTwoFactor = async (userId: string): Promise<void> => {
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${userId}.${expiresAt}.${nonce}`;
  const signature = signPendingPayload(payload);
  const token = `${payload}.${signature}`;
  const cookieStore = await cookies();
  cookieStore.set(TWO_FACTOR_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt)
  });
};

export const clearPendingTwoFactor = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(TWO_FACTOR_COOKIE);
};

export const getPendingTwoFactorUserId = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TWO_FACTOR_COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length < 4) return null;

  const signature = parts.pop();
  if (!signature) return null;
  const payload = parts.join(".");
  const expected = signPendingPayload(payload);

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  const [userId, expiresRaw] = parts;
  const expiresAt = Number(expiresRaw);
  if (!userId || Number.isNaN(expiresAt) || expiresAt < Date.now()) return null;
  return userId;
};

export const generateCsrfToken = async (): Promise<string> => {
  const token = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, { httpOnly: true, secure: isProd, sameSite: "lax", path: "/" });
  return token;
};

export const verifyCsrfToken = async (token: string): Promise<boolean> => {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE)?.value === token;
};

export const verifyMutationRequest = async (csrfToken?: string): Promise<boolean> => {
  if (csrfToken && (await verifyCsrfToken(csrfToken))) return true;

  const headerBag = await headers();
  const origin = headerBag.get("origin");
  const host = headerBag.get("x-forwarded-host") ?? headerBag.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

export const audit = async (params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: string;
}): Promise<void> => {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
};
