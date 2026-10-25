import { createHash, createSign, generateKeyPairSync, type KeyObject } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// End-to-end check of the passkey login route against @simplewebauthn/server, using a
// software authenticator and a credential row stored exactly the way the register route
// writes it (COSE public key as base64url, numeric counter, transports as JSON). This proves
// passkeys registered before a library upgrade keep verifying after it.

const selectResults: unknown[][] = [];
const updateSet = vi.fn();
const createSession = vi.fn();

vi.mock("@/server/db/client", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => selectResults.shift() ?? []
        })
      })
    }),
    update: () => ({
      set: (values: unknown) => {
        updateSet(values);
        return { where: async () => undefined };
      }
    })
  }
}));

vi.mock("@/server/auth", () => ({
  audit: vi.fn(),
  createSession: (userId: string) => createSession(userId)
}));

const ORIGIN = "http://localhost:3000";
const RP_ID = "localhost";
const CHALLENGE = "dGVzdC1jaGFsbGVuZ2UtZm9yLXBhc3NrZXktbG9naW4";
const CREDENTIAL_ID = "Y3JlZGVudGlhbC1pZC0x";

const b64url = (buffer: Buffer): string => buffer.toString("base64url");

// COSE_Key (RFC 9053) for an EC2 P-256 / ES256 key, CBOR-encoded by hand.
const coseKey = (publicKey: KeyObject): Buffer => {
  const jwk = publicKey.export({ format: "jwk" });
  const x = Buffer.from(jwk.x as string, "base64url");
  const y = Buffer.from(jwk.y as string, "base64url");
  return Buffer.concat([
    Buffer.from([0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01, 0x21, 0x58, 0x20]),
    x,
    Buffer.from([0x22, 0x58, 0x20]),
    y
  ]);
};

const assertion = (privateKey: KeyObject, signCount: number, challenge = CHALLENGE) => {
  const authenticatorData = Buffer.alloc(37);
  createHash("sha256").update(RP_ID).digest().copy(authenticatorData, 0);
  authenticatorData[32] = 0x05; // user present + user verified
  authenticatorData.writeUInt32BE(signCount, 33);
  const clientDataJSON = Buffer.from(JSON.stringify({ type: "webauthn.get", challenge, origin: ORIGIN, crossOrigin: false }));
  const signature = createSign("sha256")
    .update(Buffer.concat([authenticatorData, createHash("sha256").update(clientDataJSON).digest()]))
    .sign(privateKey);
  return {
    id: CREDENTIAL_ID,
    rawId: CREDENTIAL_ID,
    type: "public-key",
    response: {
      clientDataJSON: b64url(clientDataJSON),
      authenticatorData: b64url(authenticatorData),
      signature: b64url(signature)
    },
    clientExtensionResults: {}
  };
};

const post = async (body: unknown) => {
  process.env.DATABASE_URL ??= "postgresql://build:build@localhost:5432/build";
  const { POST } = await import("@/app/api/admin/passkeys/login/verify/route");
  const request = new NextRequest(`${ORIGIN}/api/admin/passkeys/login/verify`, {
    method: "POST",
    headers: { host: "localhost:3000", cookie: `webauthn_auth_challenge=${CHALLENGE}`, "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return POST(request);
};

describe("POST /api/admin/passkeys/login/verify", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const storedRow = {
    id: "8b3afaca-7d36-46a4-bc69-989ff1e1638f",
    userId: "1c0f3a52-0d8e-4c55-9d43-0b8f0c3f5a10",
    credentialId: CREDENTIAL_ID,
    publicKey: coseKey(publicKey).toString("base64url"),
    counter: 7,
    transports: JSON.stringify(["internal", "hybrid"])
  };

  beforeEach(() => {
    selectResults.length = 0;
    updateSet.mockClear();
    createSession.mockClear();
  });

  it("verifies a stored credential and advances its counter", async () => {
    selectResults.push([storedRow], [{ id: storedRow.userId }]);
    const response = await post({ response: assertion(privateKey, 8) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ counter: 8 }));
    expect(createSession).toHaveBeenCalledWith(storedRow.userId);
  });

  // The route lets verification errors propagate (Next answers 500); no session is created.
  it("rejects an assertion signed for another challenge", async () => {
    selectResults.push([storedRow], [{ id: storedRow.userId }]);
    await expect(post({ response: assertion(privateKey, 8, "b3RoZXItY2hhbGxlbmdl") })).rejects.toThrow(/challenge/);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("rejects a replayed (non-increasing) counter", async () => {
    selectResults.push([storedRow], [{ id: storedRow.userId }]);
    await expect(post({ response: assertion(privateKey, 7) })).rejects.toThrow(/counter/);
    expect(createSession).not.toHaveBeenCalled();
  });
});
