import type { NextRequest } from "next/server";
import { COSEALG } from "@simplewebauthn/server/helpers";
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

/**
 * Public-key algorithms offered and accepted for new passkeys: EdDSA, ES256, RS256, i.e. the
 * @simplewebauthn/server 13 defaults. From v14 the library default also puts ML-DSA-44 first
 * when the runtime exposes it, which would let new passkeys depend on an experimental Node API.
 */
export const SUPPORTED_ALGORITHM_IDS: number[] = [COSEALG.EdDSA, COSEALG.ES256, COSEALG.RS256];
