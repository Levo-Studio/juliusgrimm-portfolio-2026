import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { adminAuthenticators, adminUsers } from "@/server/db/schema";
import { audit, createSession } from "@/server/auth";
import { getWebauthnConfig } from "@/server/webauthn";

type Body = { response: unknown };
type AuthResponse = Parameters<typeof verifyAuthenticationResponse>[0]["response"];
type AllowedTransports = Parameters<typeof verifyAuthenticationResponse>[0]["credential"]["transports"];

const parseTransports = (value: string | null): AllowedTransports =>
  value ? (JSON.parse(value) as unknown as AllowedTransports) : undefined;

const hasCredentialId = (value: unknown): value is { id: string } =>
  typeof value === "object" && value !== null && "id" in value && typeof (value as { id: unknown }).id === "string";

export const POST = async (request: Request): Promise<NextResponse> => {
  const req = request as unknown as import("next/server").NextRequest;
  const config = getWebauthnConfig(req);
  const body = (await request.json()) as Body;
  if (!hasCredentialId(body.response)) return NextResponse.json({ error: "Invalid passkey payload." }, { status: 400 });

  const challenge = req.cookies.get("webauthn_auth_challenge")?.value;
  if (!challenge) return NextResponse.json({ error: "Missing challenge" }, { status: 400 });

  const [authenticator] = await db
    .select()
    .from(adminAuthenticators)
    .where(eq(adminAuthenticators.credentialId, body.response.id))
    .limit(1);
  if (!authenticator) return NextResponse.json({ error: "Passkey not found." }, { status: 400 });

  const verification = await verifyAuthenticationResponse({
    response: body.response as AuthResponse,
    expectedChallenge: challenge,
    expectedOrigin: config.origin,
    expectedRPID: config.rpID,
    credential: {
      id: authenticator.credentialId,
      publicKey: Buffer.from(authenticator.publicKey, "base64url"),
      counter: authenticator.counter,
      transports: parseTransports(authenticator.transports)
    }
  });

  if (!verification.verified) return NextResponse.json({ error: "Passkey verification failed." }, { status: 400 });

  await db.update(adminAuthenticators).set({ counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() }).where(eq(adminAuthenticators.id, authenticator.id));
  const [user] = await db.select().from(adminUsers).where(and(eq(adminUsers.id, authenticator.userId))).limit(1);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 400 });

  await createSession(user.id);
  await audit({ userId: user.id, action: "login_passkey", entityType: "auth" });

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("webauthn_auth_challenge");
  return response;
};
