import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminSessions, adminUsers, auditLogs } from "@/server/db/schema";

const SESSION_COOKIE = "admin_session";
const CSRF_COOKIE = "admin_csrf";
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

export const audit = async (params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: string;
}): Promise<void> => {
  await db.insert(auditLogs).values({
    userId: params.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata
  });
};
