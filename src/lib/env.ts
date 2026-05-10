import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32).optional(),
  GITHUB_REPO_OWNER: z.string().default("Levo-Studio"),
  GITHUB_REPO_NAME: z.string().default("juliusgrimm-portfolio-2026")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
