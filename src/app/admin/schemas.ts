import { z } from "zod";

// Input schemas for the admin server actions. They live outside actions.ts because a
// "use server" module may only export async functions, and keeping them here lets the
// accepted input sets be unit-tested directly.

export const adminEmailSchema = z.email();

export const loginSchema = z.object({
  email: z.string(),
  password: z.string()
});

export const twoFactorLoginSchema = z.object({
  code: z.string()
});

export const projectSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string().optional().default(""),
  title: z.string().min(2),
  subtitle: z.string().min(2),
  description: z.string().min(10),
  whyBuilt: z.string().min(10),
  imageUrl: z.url().optional().or(z.literal("")),
  createdAt: z.string().optional().default(""),
  visible: z.enum(["true", "false"]),
  csrf: z.string().optional()
});

export const projectCreateSchema = z.object({
  slug: z.string().optional().default(""),
  title: z.string().trim().min(2).max(160),
  subtitle: z.string().trim().min(2),
  description: z.string().trim().min(10),
  whyBuilt: z.string().trim().min(10),
  imageUrl: z.url().optional().or(z.literal("")),
  createdAt: z.string().optional().default(""),
  visible: z.enum(["true", "false"]),
  csrf: z.string().optional()
});

export const projectLinkSchema = z.object({
  label: z.string().min(1).max(80),
  url: z.url(),
  visible: z.boolean(),
  sortOrder: z.number().int().min(0)
});

export const projectTechSchema = z.object({
  label: z.string().min(1).max(80),
  colorCategory: z.enum(["green", "orange", "red", "blue"]),
  sortOrder: z.number().int().min(0)
});

export const survivalTagSchema = z.object({
  label: z.string().min(1).max(80),
  colorCategory: z.enum(["green", "orange", "red", "blue"]),
  sortOrder: z.number().int().min(0)
});

export const generateCaseStudySchema = z.object({
  prompt: z.string().trim().min(10, "Please describe the case study in a bit more detail first.").max(2000),
  csrf: z.string().optional()
});

export const deleteProjectSchema = z.object({ id: z.uuid(), csrf: z.string().optional() });

export const toggleSchema = z.object({ id: z.uuid(), visible: z.enum(["true", "false"]), csrf: z.string().optional() });

export const sessionSchema = z.object({ sessionId: z.uuid(), csrf: z.string().optional() });

export const passwordSchema = z.object({ currentPassword: z.string().min(12), newPassword: z.string().min(12), confirmPassword: z.string().min(12), csrf: z.string().optional() });

export const twoFactorSetupSchema = z.object({ csrf: z.string().optional() });

export const twoFactorConfirmSchema = z.object({ csrf: z.string().optional(), code: z.string().min(6) });

export const twoFactorDisableSchema = z.object({ csrf: z.string().optional() });

export const deletePasskeySchema = z.object({ csrf: z.string().optional(), authenticatorId: z.uuid() });

export type ProjectLinkInput = z.infer<typeof projectLinkSchema>;
export type ProjectTechInput = z.infer<typeof projectTechSchema>;
export type SurvivalTagInput = z.infer<typeof survivalTagSchema>;
