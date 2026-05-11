import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { adminAuthenticators } from "@/server/db/schema";
import { getSessionUser } from "@/server/auth";
import { getWebauthnConfig } from "@/server/webauthn";

type ExcludedTransports = NonNullable<Parameters<typeof generateRegistrationOptions>[0]["excludeCredentials"]>[number]["transports"];

const parseTransports = (value: string | null): ExcludedTransports =>
  value ? (JSON.parse(value) as unknown as ExcludedTransports) : undefined;

export const POST = async (request: Request): Promise<NextResponse> => {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const req = request as unknown as import("next/server").NextRequest;
  const config = getWebauthnConfig(req);

  const existing = await db.select().from(adminAuthenticators).where(eq(adminAuthenticators.userId, user.id));
  const options = await generateRegistrationOptions({
    rpID: config.rpID,
    rpName: config.rpName,
    userName: user.email,
    userDisplayName: user.email,
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    excludeCredentials: existing.map((item) => ({
      id: item.credentialId,
      transports: parseTransports(item.transports)
    }))
  });

  const response = NextResponse.json(options);
  response.cookies.set("webauthn_reg_challenge", options.challenge, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10
  });
  return response;
};
