import { createHmac } from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateTotpSecret, totpKeyUri, verifyTotp } from "@/server/totp";

// Expected codes were produced by otplib 12.0.1 `authenticator` (the library that generated
// every secret stored in admin_two_factor_secrets). The RFC secret rows match the SHA-1
// test vectors of RFC 6238 Appendix B (truncated to 6 digits). If any of these change,
// existing authenticator apps would stop producing accepted codes.
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // base32("12345678901234567890")
const LEGACY_SECRETS = ["JBSWY3DPEHPK3PXP", "MBIJH5YJ6B2YQB5D"]; // 16 chars = 10 bytes, otplib 12 default

const vectors: Array<{ secret: string; time: number; code: string }> = [
  { secret: RFC_SECRET, time: 59_000, code: "287082" },
  { secret: RFC_SECRET, time: 1_111_111_109_000, code: "081804" },
  { secret: RFC_SECRET, time: 1_234_567_890_000, code: "005924" },
  { secret: RFC_SECRET, time: 2_000_000_000_000, code: "279037" },
  { secret: LEGACY_SECRETS[0], time: 59_000, code: "996554" },
  { secret: LEGACY_SECRETS[0], time: 1_111_111_109_000, code: "071271" },
  { secret: LEGACY_SECRETS[0], time: 1_234_567_890_000, code: "742275" },
  { secret: LEGACY_SECRETS[0], time: 2_000_000_000_000, code: "890699" },
  { secret: LEGACY_SECRETS[0], time: 1_761_400_000_000, code: "892575" },
  { secret: LEGACY_SECRETS[1], time: 59_000, code: "244643" },
  { secret: LEGACY_SECRETS[1], time: 1_111_111_109_000, code: "432251" },
  { secret: LEGACY_SECRETS[1], time: 1_234_567_890_000, code: "409022" },
  { secret: LEGACY_SECRETS[1], time: 2_000_000_000_000, code: "639038" },
  { secret: LEGACY_SECRETS[1], time: 1_761_400_000_000, code: "088168" }
];

// Minimal RFC 4648 base32 + RFC 6238 (SHA-1, 6 digits, 30 s) used as an oracle.
const referenceTotp = (base32Secret: string, timeMs: number): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of base32Secret) bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const key = Buffer.from((bits.match(/.{8}/g) ?? []).map((byte) => parseInt(byte, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(timeMs / 1000 / 30)));
  const hmac = createHmac("sha1", key).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  return String((hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, "0");
};

it.each(vectors)("reference implementation agrees with vector $code", ({ secret, time, code }) => {
  expect(referenceTotp(secret, time)).toBe(code);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("verifyTotp", () => {
  it.each(vectors)("accepts $code for $secret at $time", ({ secret, time, code }) => {
    vi.useFakeTimers();
    vi.setSystemTime(time);
    expect(verifyTotp(code, secret)).toBe(true);
  });

  it("only accepts the current 30-second step (no drift window)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_761_400_000_000 + 30_000);
    expect(verifyTotp("892575", "JBSWY3DPEHPK3PXP")).toBe(false);
    vi.setSystemTime(1_761_400_000_000 - 30_000);
    expect(verifyTotp("892575", "JBSWY3DPEHPK3PXP")).toBe(false);
  });

  it("rejects a wrong code and malformed input without throwing", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_761_400_000_000);
    expect(verifyTotp("892576", "JBSWY3DPEHPK3PXP")).toBe(false);
    expect(verifyTotp("abcdef", "JBSWY3DPEHPK3PXP")).toBe(false);
    expect(verifyTotp("12345", "JBSWY3DPEHPK3PXP")).toBe(false);
  });

  it("round-trips freshly generated secrets against an independent RFC 6238 implementation", () => {
    vi.useFakeTimers();
    const time = 1_761_400_000_000;
    vi.setSystemTime(time);
    for (let i = 0; i < 5; i += 1) {
      const secret = generateTotpSecret();
      expect(verifyTotp(referenceTotp(secret, time), secret)).toBe(true);
    }
  });
});

describe("generateTotpSecret", () => {
  it("produces 16-character base32 secrets (10 random bytes), like otplib 12", () => {
    const secrets = new Set(Array.from({ length: 20 }, () => generateTotpSecret()));
    expect(secrets.size).toBe(20);
    for (const secret of secrets) expect(secret).toMatch(/^[A-Z2-7]{16}$/);
  });
});

describe("totpKeyUri", () => {
  it("keeps the exact otpauth URI encoded in the setup QR code", () => {
    expect(totpKeyUri("me@example.com", "Julius Grimm Admin", "JBSWY3DPEHPK3PXP")).toBe(
      "otpauth://totp/Julius%20Grimm%20Admin:me%40example.com?secret=JBSWY3DPEHPK3PXP&period=30&digits=6&algorithm=SHA1&issuer=Julius%20Grimm%20Admin"
    );
  });

  it("encodes special characters and handles an empty issuer like otplib 12", () => {
    expect(totpKeyUri("me@x.de", "Grimm & Co: Admin/ä", "JBSWY3DPEHPK3PXP")).toBe(
      "otpauth://totp/Grimm%20%26%20Co%3A%20Admin%2F%C3%A4:me%40x.de?secret=JBSWY3DPEHPK3PXP&period=30&digits=6&algorithm=SHA1&issuer=Grimm%20%26%20Co%3A%20Admin%2F%C3%A4"
    );
    expect(totpKeyUri("a b+c@x.de", "", "JBSWY3DPEHPK3PXP")).toBe(
      "otpauth://totp/a%20b%2Bc%40x.de:a%20b%2Bc%40x.de?secret=JBSWY3DPEHPK3PXP&period=30&digits=6&algorithm=SHA1"
    );
  });
});
