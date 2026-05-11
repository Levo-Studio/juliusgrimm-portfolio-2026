import type { NextRequest } from "next/server";
import { env } from "@/lib/env";

export type WebauthnConfig = {
  rpID: string;
  rpName: string;
  origin: string;
};

export const getWebauthnConfig = (request: NextRequest): WebauthnConfig => {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const defaultOrigin = `${proto}://${host}`;

  return {
    rpID: env.WEBAUTHN_RP_ID ?? host.split(":")[0],
    rpName: env.WEBAUTHN_RP_NAME ?? "Julius Grimm Admin",
    origin: env.WEBAUTHN_ORIGIN ?? env.AUTH_URL ?? defaultOrigin
  };
};

