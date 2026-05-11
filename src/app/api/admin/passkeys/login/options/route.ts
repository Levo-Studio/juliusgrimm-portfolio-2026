import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { db } from "@/server/db/client";
import { adminAuthenticators } from "@/server/db/schema";
import { getWebauthnConfig } from "@/server/webauthn";

type AllowedTransports = NonNullable<Parameters<typeof generateAuthenticationOptions>[0]["allowCredentials"]>[number]["transports"];

const parseTransports = (value: string | null): AllowedTransports =>
  value ? (JSON.parse(value) as unknown as AllowedTransports) : undefined;

export const POST = async (request: Request): Promise<NextResponse> => {
  const req = request as unknown as import("next/server").NextRequest;
  const config = getWebauthnConfig(req);

  const authenticators = await db.select().from(adminAuthenticators);
  if (authenticators.length === 0) return NextResponse.json({ error: "No passkeys registered yet." }, { status: 400 });

  const options = await generateAuthenticationOptions({
    rpID: config.rpID,
    userVerification: "preferred",
    allowCredentials: authenticators.map((item) => ({
      id: item.credentialId,
      transports: parseTransports(item.transports)
    }))
  });

  const response = NextResponse.json(options);
  response.cookies.set("webauthn_auth_challenge", options.challenge, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10
  });
  return response;
};
