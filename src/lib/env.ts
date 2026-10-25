import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  WEBAUTHN_RP_ID: z.string().optional(),
  WEBAUTHN_RP_NAME: z.string().optional(),
  WEBAUTHN_ORIGIN: z.url().optional(),
  TOTP_ISSUER: z.string().optional(),
  AUTH_URL: z.url().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_MODEL: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
