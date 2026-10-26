import { createHash, generateKeyPairSync, randomBytes } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Passkey registration must keep offering and accepting the same public-key algorithms as
// before the @simplewebauthn/server 14 upgrade (EdDSA, ES256, RS256 — the v13 defaults).
// v14's defaults put the post-quantum ML-DSA-44 first on runtimes that expose it, which
// would let new passkeys depend on an experimental Node API.

const inserted = vi.fn();

vi.mock("@/server/db/client", () => ({
  db: {
    select: () => ({ from: () => ({ where: async () => [] }) }),
    insert: () => ({ values: async (values: unknown) => inserted(values) })
  }
}));

vi.mock("@/server/auth", () => ({
  audit: vi.fn(),
  getSessionUser: async () => ({ id: "1c0f3a52-0d8e-4c55-9d43-0b8f0c3f5a10", email: "me@example.com" })
}));

const ORIGIN = "http://localhost:3000";
const RP_ID = "localhost";
const CHALLENGE = "cmVnaXN0cmF0aW9uLWNoYWxsZW5nZS1mb3ItdGVzdHM";

process.env.DATABASE_URL ??= "postgresql://build:build@localhost:5432/build";

const request = (path: string, body?: unknown, cookie?: string) => {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { host: "localhost:3000", "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
};

// Minimal CBOR helpers for a "none" attestation object.
const cborBytesHeader = (length: number): Buffer =>
  length < 24 ? Buffer.from([0x40 + length]) : length < 256 ? Buffer.from([0x58, length]) : Buffer.from([0x59, length >> 8, length & 0xff]);
const cborText = (text: string): Buffer => Buffer.concat([Buffer.from([0x60 + text.length]), Buffer.from(text)]);

const es256CoseKey = (): Buffer => {
  const jwk = generateKeyPairSync("ec", { namedCurve: "P-256" }).publicKey.export({ format: "jwk" });
  return Buffer.concat([
    Buffer.from([0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01, 0x21, 0x58, 0x20]),
    Buffer.from(jwk.x as string, "base64url"),
    Buffer.from([0x22, 0x58, 0x20]),
    Buffer.from(jwk.y as string, "base64url")
  ]);
};

// COSE_Key { kty: AKP (7), alg: ML-DSA-44 (-48), pub: 1312 bytes }
const mlDsa44CoseKey = (): Buffer =>
  Buffer.concat([Buffer.from([0xa3, 0x01, 0x07, 0x03, 0x38, 0x2f, 0x20]), cborBytesHeader(1312), randomBytes(1312)]);

const registrationResponse = (coseKey: Buffer) => {
  const credentialId = randomBytes(16);
  const authData = Buffer.concat([
    createHash("sha256").update(RP_ID).digest(),
    Buffer.from([0x45]), // user present + user verified + attested credential data
    Buffer.alloc(4), // sign count
    Buffer.alloc(16), // AAGUID
    Buffer.from([0x00, credentialId.length]),
    credentialId,
    coseKey
  ]);
  const attestationObject = Buffer.concat([
    Buffer.from([0xa3]),
    cborText("fmt"),
    cborText("none"),
    cborText("attStmt"),
    Buffer.from([0xa0]),
    cborText("authData"),
    cborBytesHeader(authData.length),
    authData
  ]);
  const clientDataJSON = Buffer.from(JSON.stringify({ type: "webauthn.create", challenge: CHALLENGE, origin: ORIGIN, crossOrigin: false }));
  return {
    id: credentialId.toString("base64url"),
    rawId: credentialId.toString("base64url"),
    type: "public-key",
    response: {
      clientDataJSON: clientDataJSON.toString("base64url"),
      attestationObject: attestationObject.toString("base64url"),
      transports: ["internal"]
    },
    clientExtensionResults: {}
  };
};

const verify = async (coseKey: Buffer) => {
  const { POST } = await import("@/app/api/admin/passkeys/register/verify/route");
  return POST(request("/api/admin/passkeys/register/verify", { response: registrationResponse(coseKey) }, `webauthn_reg_challenge=${CHALLENGE}`));
};

describe("passkey registration algorithms", () => {
  beforeEach(() => inserted.mockClear());

  it("offers EdDSA, ES256 and RS256, in that order, and nothing else", async () => {
    const { POST } = await import("@/app/api/admin/passkeys/register/options/route");
    const response = await POST(request("/api/admin/passkeys/register/options"));
    expect(response.status).toBe(200);
    const options = (await response.json()) as { pubKeyCredParams: Array<{ alg: number; type: string }> };
    expect(options.pubKeyCredParams).toEqual([
      { alg: -8, type: "public-key" },
      { alg: -7, type: "public-key" },
      { alg: -257, type: "public-key" }
    ]);
  });

  it("stores an ES256 passkey", async () => {
    const response = await verify(es256CoseKey());
    expect(response.status).toBe(200);
    expect(inserted).toHaveBeenCalledTimes(1);
  });

  it("refuses to enrol an ML-DSA-44 passkey", async () => {
    await expect(verify(mlDsa44CoseKey())).rejects.toThrow(/Unexpected public key alg "-48"/);
    expect(inserted).not.toHaveBeenCalled();
  });
});
