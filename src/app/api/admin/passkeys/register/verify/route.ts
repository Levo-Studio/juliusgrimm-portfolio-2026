import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { adminAuthenticators } from "@/server/db/schema";
import { audit, getSessionUser } from "@/server/auth";
import { getWebauthnConfig } from "@/server/webauthn";

type Body = { response: unknown };

export const POST = async (request: Request): Promise<NextResponse> => {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const req = request as unknown as import("next/server").NextRequest;
  const config = getWebauthnConfig(req);
  const body = (await request.json()) as Body;
  const challenge = req.cookies.get("webauthn_reg_challenge")?.value;
  if (!challenge) return NextResponse.json({ error: "Missing challenge" }, { status: 400 });

  const verification = await verifyRegistrationResponse({
    response: body.response as Parameters<typeof verifyRegistrationResponse>[0]["response"],
    expectedChallenge: challenge,
    expectedOrigin: config.origin,
    expectedRPID: config.rpID
  });

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const { registrationInfo } = verification;
  const transports = registrationInfo.credential.transports?.length
    ? JSON.stringify(registrationInfo.credential.transports)
    : null;

  await db.insert(adminAuthenticators).values({
    userId: user.id,
    credentialId: registrationInfo.credential.id,
    publicKey: Buffer.from(registrationInfo.credential.publicKey).toString("base64url"),
    counter: registrationInfo.credential.counter,
    transports,
    deviceType: registrationInfo.credentialDeviceType,
    backedUp: registrationInfo.credentialBackedUp,
    lastUsedAt: new Date()
  });

  await audit({ userId: user.id, action: "passkey_register", entityType: "authenticator", entityId: registrationInfo.credential.id });

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("webauthn_reg_challenge");
  return response;
};

