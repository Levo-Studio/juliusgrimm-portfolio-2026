import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  WEBAUTHN_RP_ID: z.string().optional(),
  WEBAUTHN_RP_NAME: z.string().optional(),
  WEBAUTHN_ORIGIN: z.string().url().optional(),
  TOTP_ISSUER: z.string().optional(),
  AUTH_URL: z.string().url().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_MODEL: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
