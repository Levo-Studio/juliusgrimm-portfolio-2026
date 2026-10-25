import { describe, expect, it } from "vitest";
import { URL_CASES } from "@/tests/url-cases";

const loadSchema = async () => {
  process.env.DATABASE_URL ??= "postgresql://build:build@localhost:5432/build";
  return (await import("@/lib/env")).envSchema;
};

describe("envSchema", () => {
  it.each(URL_CASES)("URL vars: %j -> %s", async (url, accepted) => {
    const envSchema = await loadSchema();
    const result = envSchema.safeParse({ DATABASE_URL: url, AUTH_URL: url, WEBAUTHN_ORIGIN: url });
    expect(result.success).toBe(accepted);
    if (result.success) {
      expect(result.data.DATABASE_URL).toBe(url);
      expect(result.data.AUTH_URL).toBe(url);
      expect(result.data.WEBAUTHN_ORIGIN).toBe(url);
    }
  });

  it("requires DATABASE_URL and keeps the other vars optional", async () => {
    const envSchema = await loadSchema();
    expect(envSchema.safeParse({}).success).toBe(false);
    expect(envSchema.safeParse({ DATABASE_URL: "postgresql://u@localhost/db" }).success).toBe(true);
  });

  it("reports invalid vars per field", async () => {
    const envSchema = await loadSchema();
    const result = envSchema.safeParse({ DATABASE_URL: "not a url", AUTH_URL: "nope" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(Object.keys(result.error.flatten().fieldErrors).sort()).toEqual(["AUTH_URL", "DATABASE_URL"]);
  });
});
