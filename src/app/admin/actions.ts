"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { and, count, eq, isNull } from "drizzle-orm";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { db } from "@/server/db/client";
import { adminAuthenticators, adminSessions, adminTwoFactorSecrets, adminUsers, projectLinks, projects, projectTechStack } from "@/server/db/schema";
import {
  audit,
  clearPendingTwoFactor,
  clearSession,
  createPendingTwoFactor,
  createSession,
  getPendingTwoFactorUserId,
  getSessionUser,
  hashPassword,
  rateLimitAuth,
  verifyMutationRequest,
  verifyPassword
} from "@/server/auth";
import { env } from "@/lib/env";

const loginSchema = z.object({
  email: z.string(),
  password: z.string()
});

const twoFactorLoginSchema = z.object({
  code: z.string()
});

export type LoginState = { ok: boolean; error?: string };
export type TwoFactorLoginState = { ok: boolean; error?: string };

export const loginAdmin = async (_prevState: LoginState, formData: FormData): Promise<LoginState> => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) return { ok: false, error: "Invalid form submission." };

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;
  if (!z.string().email().safeParse(email).success || password.length < 12) {
    return { ok: false, error: "Please use a valid email and a password with at least 12 characters." };
  }

  const headerBag = await headers();
  const loginFingerprint = `${email}::${headerBag.get("x-forwarded-for") ?? headerBag.get("x-real-ip") ?? "unknown-ip"}`;
  if (!rateLimitAuth(loginFingerprint)) return { ok: false, error: "Too many login attempts. Please wait a few minutes." };

  try {
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(adminUsers);
    if (totalUsers === 0) {
      const [createdUser] = await db
        .insert(adminUsers)
        .values({
          email,
          passwordHash: await hashPassword(password),
          role: "admin"
        })
        .returning();

      await createSession(createdUser.id);
      await audit({ userId: createdUser.id, action: "first_admin_created", entityType: "auth", metadata: createdUser.email });
      await audit({ userId: createdUser.id, action: "login", entityType: "auth" });
      revalidatePath("/admin");
      redirect("/admin");
    }

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      await audit({ action: "failed_login", entityType: "auth", metadata: email });
      return { ok: false, error: "Invalid credentials." };
    }

    if (user.twoFactorEnabled) {
      await createPendingTwoFactor(user.id);
      await audit({ userId: user.id, action: "login_2fa_challenge", entityType: "auth" });
      redirect("/admin/2fa");
    }

    await clearPendingTwoFactor();
    await createSession(user.id);
    await audit({ userId: user.id, action: "login", entityType: "auth" });
    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    console.error("Admin login/create failed:", error);
    return { ok: false, error: "Could not create/login admin user. Check database permissions and schema." };
  }
};

export const verifyTwoFactorLogin = async (_prevState: TwoFactorLoginState, formData: FormData): Promise<TwoFactorLoginState> => {
  const parsed = twoFactorLoginSchema.safeParse({
    code: formData.get("code")
  });
  if (!parsed.success) return { ok: false, error: "Invalid form submission." };
  const userId = await getPendingTwoFactorUserId();
  if (!userId) return { ok: false, error: "2FA session expired. Please sign in again." };

  const code = parsed.data.code.replace(/\D/g, "");
  if (code.length !== 6) return { ok: false, error: "Enter a valid 6-digit code." };

  const [secret] = await db.select().from(adminTwoFactorSecrets).where(eq(adminTwoFactorSecrets.userId, userId)).limit(1);
  if (!secret || !authenticator.check(code, secret.secretEncrypted)) {
    await audit({ userId, action: "failed_login_2fa", entityType: "auth" });
    return { ok: false, error: "Invalid 2FA code." };
  }

  await clearPendingTwoFactor();
  await createSession(userId);
  await audit({ userId, action: "login", entityType: "auth" });
  revalidatePath("/admin");
  redirect("/admin");
};

export const logoutAdmin = async (): Promise<void> => {
  const user = await getSessionUser();
  if (user) await audit({ userId: user.id, action: "logout", entityType: "auth" });
  await clearSession();
  revalidatePath("/admin");
  redirect("/admin");
};


const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getUniqueProjectSlug = async (baseValue: string, projectId?: string): Promise<string> => {
  const baseSlug = slugify(baseValue) || "case-study";
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, candidate)).limit(1);
    if (existing.length === 0 || (projectId && existing[0]?.id === projectId)) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const resolveSlugSource = (slugInput: string, titleInput: string): string => {
  const normalizedSlug = slugify(slugInput);
  if (normalizedSlug.length > 0) return normalizedSlug;
  return titleInput;
};
const projectSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().optional().default(""),
  title: z.string().min(2),
  subtitle: z.string().min(2),
  description: z.string().min(10),
  whyBuilt: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal("")),
  visible: z.enum(["true", "false"]),
  sortOrder: z.coerce.number().int(),
  csrf: z.string().optional()
});
const projectCreateSchema = z.object({
  slug: z.string().optional().default(""),
  title: z.string().trim().min(2).max(160),
  subtitle: z.string().trim().min(2),
  description: z.string().trim().min(10),
  whyBuilt: z.string().trim().min(10),
  imageUrl: z.string().url().optional().or(z.literal("")),
  visible: z.enum(["true", "false"]),
  sortOrder: z.coerce.number().int(),
  csrf: z.string().optional()
});

const projectLinkSchema = z.object({
  label: z.string().min(1).max(80),
  url: z.string().url(),
  visible: z.boolean(),
  sortOrder: z.number().int().min(0)
});

const projectTechSchema = z.object({
  label: z.string().min(1).max(80),
  colorCategory: z.enum(["green", "orange", "red", "blue"]),
  sortOrder: z.number().int().min(0)
});

export const upsertProject = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  const rawId = String(formData.get("id") ?? "");
  if (!user) {
    redirect("/admin");
  }

  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect(`/admin/projects/${rawId}?error=invalid-form`);
  }
  if (!(await verifyMutationRequest(parsed.data.csrf))) {
    redirect(`/admin/projects/${rawId}?error=csrf`);
  }
  if (!parsed.data.id) {
    redirect("/admin?tab=case-studies&error=missing-id");
  }

  const projectSlug = await getUniqueProjectSlug(resolveSlugSource(parsed.data.slug, parsed.data.title), parsed.data.id);

  await db
    .update(projects)
    .set({
      slug: projectSlug,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      whyBuilt: parsed.data.whyBuilt,
      imageUrl: parsed.data.imageUrl || null,
      visible: parsed.data.visible === "true",
      sortOrder: parsed.data.sortOrder,
      updatedAt: new Date()
    })
    .where(eq(projects.id, parsed.data.id));

  const linkLabels = formData.getAll("linkLabel");
  const linkUrls = formData.getAll("linkUrl");
  const linkVisible = formData.getAll("linkVisible");
  const linkSort = formData.getAll("linkSortOrder");

  const rawLinks = linkLabels.map((_, index) => ({
    label: String(linkLabels[index] ?? "").trim(),
    url: String(linkUrls[index] ?? "").trim(),
    visible: String(linkVisible[index] ?? "true") === "true",
    sortOrder: Number(String(linkSort[index] ?? index + 1))
  }));

  const parsedLinks = rawLinks
    .filter((item) => item.label.length > 0 && item.url.length > 0)
    .map((item) => projectLinkSchema.safeParse(item))
    .filter((result): result is { success: true; data: z.infer<typeof projectLinkSchema> } => result.success)
    .map((result) => result.data);

  await db.delete(projectLinks).where(eq(projectLinks.projectId, parsed.data.id));
  if (parsedLinks.length > 0) {
    await db.insert(projectLinks).values(
      parsedLinks.map((item, index) => ({
        projectId: parsed.data.id as string,
        label: item.label,
        url: item.url,
        visible: item.visible,
        sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index + 1
      }))
    );
  }

  const techLabels = formData.getAll("techLabel");
  const techColors = formData.getAll("techColorCategory");
  const techSort = formData.getAll("techSortOrder");
  const rawTech = techLabels.map((_, index) => ({
    label: String(techLabels[index] ?? "").trim(),
    colorCategory: String(techColors[index] ?? "green"),
    sortOrder: Number(String(techSort[index] ?? index + 1))
  }));
  const parsedTech = rawTech
    .filter((item) => item.label.length > 0)
    .map((item) => projectTechSchema.safeParse(item))
    .filter((result): result is { success: true; data: z.infer<typeof projectTechSchema> } => result.success)
    .map((result) => result.data);
  await db.delete(projectTechStack).where(eq(projectTechStack.projectId, parsed.data.id));
  if (parsedTech.length > 0) {
    await db.insert(projectTechStack).values(
      parsedTech.map((item, index) => ({
        projectId: parsed.data.id as string,
        label: item.label,
        colorCategory: item.colorCategory,
        sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index + 1
      }))
    );
  }

  await audit({ userId: user.id, action: parsed.data.visible === "true" ? "project_edit" : "project_hide_show", entityType: "project", entityId: parsed.data.id });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/projects/${projectSlug}`);
  redirect("/admin?tab=case-studies&saved=1");
};

export const createProject = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) redirect("/admin");

  const parsed = projectCreateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect("/admin/projects/new?error=invalid-form");
  }
  if (!(await verifyMutationRequest(parsed.data.csrf))) {
    redirect("/admin/projects/new?error=csrf");
  }

  try {
    const projectSlug = await getUniqueProjectSlug(resolveSlugSource(parsed.data.slug, parsed.data.title));

    const [created] = await db
      .insert(projects)
      .values({
        slug: projectSlug,
        title: parsed.data.title.trim(),
        subtitle: parsed.data.subtitle.trim(),
        description: parsed.data.description.trim(),
        whyBuilt: parsed.data.whyBuilt.trim(),
        imageUrl: parsed.data.imageUrl || null,
        visible: parsed.data.visible === "true",
        sortOrder: parsed.data.sortOrder
      })
      .returning();

    const linkLabels = formData.getAll("linkLabel");
    const linkUrls = formData.getAll("linkUrl");
    const linkVisible = formData.getAll("linkVisible");
    const linkSort = formData.getAll("linkSortOrder");

    const rawLinks = linkLabels.map((_, index) => ({
      label: String(linkLabels[index] ?? "").trim(),
      url: String(linkUrls[index] ?? "").trim(),
      visible: String(linkVisible[index] ?? "true") === "true",
      sortOrder: Number(String(linkSort[index] ?? index + 1))
    }));

    const parsedLinks = rawLinks
      .filter((item) => item.label.length > 0 && item.url.length > 0)
      .map((item) => projectLinkSchema.safeParse(item))
      .filter((result): result is { success: true; data: z.infer<typeof projectLinkSchema> } => result.success)
      .map((result) => result.data);

    if (parsedLinks.length > 0) {
      await db.insert(projectLinks).values(
        parsedLinks.map((item, index) => ({
          projectId: created.id,
          label: item.label,
          url: item.url,
          visible: item.visible,
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index + 1
        }))
      );
    }

    const techLabels = formData.getAll("techLabel");
    const techColors = formData.getAll("techColorCategory");
    const techSort = formData.getAll("techSortOrder");
    const rawTech = techLabels.map((_, index) => ({
      label: String(techLabels[index] ?? "").trim(),
      colorCategory: String(techColors[index] ?? "green"),
      sortOrder: Number(String(techSort[index] ?? index + 1))
    }));
    const parsedTech = rawTech
      .filter((item) => item.label.length > 0)
      .map((item) => projectTechSchema.safeParse(item))
      .filter((result): result is { success: true; data: z.infer<typeof projectTechSchema> } => result.success)
      .map((result) => result.data);
    if (parsedTech.length > 0) {
      await db.insert(projectTechStack).values(
        parsedTech.map((item, index) => ({
          projectId: created.id,
          label: item.label,
          colorCategory: item.colorCategory,
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index + 1
        }))
      );
    }

    await audit({ userId: user.id, action: "project_create", entityType: "project", entityId: created.id });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/projects/${created.slug}`);
    redirect("/admin?tab=case-studies&saved=1");
  } catch (error) {
    console.error("Create project failed:", error);
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const isUniqueViolation = message.includes("unique") || message.includes("duplicate key") || message.includes("projects_slug_idx") || message.includes("projects_slug_key");
    if (isUniqueViolation) {
      redirect("/admin/projects/new?error=slug-conflict");
    }
    redirect("/admin/projects/new?error=create-failed");
  }
};

const toggleSchema = z.object({ id: z.string().uuid(), visible: z.enum(["true", "false"]), csrf: z.string().optional() });

export const toggleProjectVisibility = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) return;
  const parsed = toggleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyMutationRequest(parsed.data.csrf))) return;

  const visible = parsed.data.visible === "true";
  await db.update(projects).set({ visible, updatedAt: new Date() }).where(eq(projects.id, parsed.data.id));
  await audit({ userId: user.id, action: "project_hide_show", entityType: "project", entityId: parsed.data.id, metadata: visible ? "visible" : "hidden" });
  revalidatePath("/");
  revalidatePath("/admin");
};

export const createOrbitalyCaseStudy = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) redirect("/admin");

  const csrf = String(formData.get("csrf") ?? "");
  if (!(await verifyMutationRequest(csrf || undefined))) redirect("/admin?tab=case-studies&error=csrf");

  const [project] = await db
    .insert(projects)
    .values({
      slug: "orbitaly",
      title: "Orbitaly",
      subtitle: "Messenger encryption paranoia, so I built my own.",
      description:
        "A self-hosted Matrix onboarding platform built because trusting random messenger stacks felt reckless. Orbitaly turns Matrix client setup into a flow that normal people can finish without rage quitting.",
      whyBuilt:
        "I was paranoid about messenger encryption and onboarding complexity, so I built Orbitaly to make secure Matrix client onboarding as easy as possible while keeping everything under my own control.",
      visible: true,
      sortOrder: 5
    })
    .onConflictDoUpdate({
      target: projects.slug,
      set: {
        title: "Orbitaly",
        subtitle: "Messenger encryption paranoia, so I built my own.",
        description:
          "A self-hosted Matrix onboarding platform built because trusting random messenger stacks felt reckless. Orbitaly turns Matrix client setup into a flow that normal people can finish without rage quitting.",
        whyBuilt:
          "I was paranoid about messenger encryption and onboarding complexity, so I built Orbitaly to make secure Matrix client onboarding as easy as possible while keeping everything under my own control.",
        visible: true,
        sortOrder: 5,
        updatedAt: new Date()
      }
    })
    .returning();

  await db.delete(projectTechStack).where(eq(projectTechStack.projectId, project.id));
  await db.delete(projectLinks).where(eq(projectLinks.projectId, project.id));

  await db.insert(projectTechStack).values([
    { projectId: project.id, label: "Next.js", colorCategory: "green", sortOrder: 1 },
    { projectId: project.id, label: "TypeScript", colorCategory: "green", sortOrder: 2 },
    { projectId: project.id, label: "PostgreSQL", colorCategory: "green", sortOrder: 3 },
    { projectId: project.id, label: "Matrix", colorCategory: "blue", sortOrder: 4 },
    { projectId: project.id, label: "Docker", colorCategory: "orange", sortOrder: 5 }
  ]);

  await db.insert(projectLinks).values([
    { projectId: project.id, label: "orbitaly.de", url: "https://orbitaly.de", visible: true, sortOrder: 1 },
    { projectId: project.id, label: "GitHub", url: "https://github.com/levo-studio/orbitaly", visible: true, sortOrder: 2 }
  ]);

  await audit({ userId: user.id, action: "project_create", entityType: "project", entityId: project.id, metadata: "orbitaly" });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/projects/orbitaly");
  redirect("/admin?tab=case-studies&saved=1");
};

const sessionSchema = z.object({ sessionId: z.string().uuid(), csrf: z.string().optional() });

export const revokeSession = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) return;
  const parsed = sessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyMutationRequest(parsed.data.csrf))) return;

  await db.update(adminSessions).set({ revokedAt: new Date() }).where(and(eq(adminSessions.id, parsed.data.sessionId), isNull(adminSessions.revokedAt)));
  await audit({ userId: user.id, action: "session_revoke", entityType: "session", entityId: parsed.data.sessionId });
  revalidatePath("/admin");
};

const passwordSchema = z.object({ currentPassword: z.string().min(12), newPassword: z.string().min(12), confirmPassword: z.string().min(12), csrf: z.string().optional() });

export type PasswordState = { ok: boolean; error?: string; message?: string };
export type TwoFactorState = {
  ok: boolean;
  error?: string;
  message?: string;
  secret?: string;
  qrDataUrl?: string;
  enabled?: boolean;
};

export const changePassword = async (_prev: PasswordState, formData: FormData): Promise<PasswordState> => {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyMutationRequest(parsed.data.csrf))) return { ok: false, error: "Invalid form submission." };
  if (parsed.data.newPassword !== parsed.data.confirmPassword) return { ok: false, error: "New passwords do not match." };

  const [dbUser] = await db.select().from(adminUsers).where(eq(adminUsers.id, user.id)).limit(1);
  if (!dbUser) return { ok: false, error: "User not found." };
  if (!(await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash))) return { ok: false, error: "Current password is incorrect." };

  await db.update(adminUsers).set({ passwordHash: await hashPassword(parsed.data.newPassword), updatedAt: new Date() }).where(eq(adminUsers.id, user.id));
  await audit({ userId: user.id, action: "password_change", entityType: "auth" });
  return { ok: true, message: "Password updated." };
};

const twoFactorSetupSchema = z.object({ csrf: z.string().optional() });
const twoFactorConfirmSchema = z.object({ csrf: z.string().optional(), code: z.string().min(6) });
const twoFactorDisableSchema = z.object({ csrf: z.string().optional() });
const deletePasskeySchema = z.object({ csrf: z.string().optional(), authenticatorId: z.string().uuid() });

export const startTwoFactorSetup = async (_prev: TwoFactorState, formData: FormData): Promise<TwoFactorState> => {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const parsed = twoFactorSetupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyMutationRequest(parsed.data.csrf))) return { ok: false, error: "Invalid form submission." };

  let [secretRow] = await db.select().from(adminTwoFactorSecrets).where(eq(adminTwoFactorSecrets.userId, user.id)).limit(1);
  if (!secretRow) {
    const secret = authenticator.generateSecret();
    [secretRow] = await db.insert(adminTwoFactorSecrets).values({ userId: user.id, secretEncrypted: secret }).returning();
  }

  const issuer = env.TOTP_ISSUER ?? "Julius Grimm Admin";
  const otpAuthUrl = authenticator.keyuri(user.email, issuer, secretRow.secretEncrypted);
  const qrDataUrl = await QRCode.toDataURL(otpAuthUrl);

  return {
    ok: true,
    message: "Scan this QR and confirm with your 6-digit code.",
    secret: secretRow.secretEncrypted,
    qrDataUrl,
    enabled: false
  };
};

export const confirmTwoFactorSetup = async (_prev: TwoFactorState, formData: FormData): Promise<TwoFactorState> => {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const parsed = twoFactorConfirmSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyMutationRequest(parsed.data.csrf))) return { ok: false, error: "Invalid form submission." };

  const code = parsed.data.code.replace(/\D/g, "");
  if (code.length !== 6) return { ok: false, error: "Please enter a valid 6-digit code." };

  const [secretRow] = await db.select().from(adminTwoFactorSecrets).where(eq(adminTwoFactorSecrets.userId, user.id)).limit(1);
  if (!secretRow) return { ok: false, error: "No pending 2FA setup found." };
  if (!authenticator.check(code, secretRow.secretEncrypted)) return { ok: false, error: "Invalid authenticator code." };

  await db.update(adminUsers).set({ twoFactorEnabled: true, updatedAt: new Date() }).where(eq(adminUsers.id, user.id));
  await audit({ userId: user.id, action: "2fa_enabled", entityType: "auth" });
  revalidatePath("/admin");
  return { ok: true, enabled: true, message: "2FA enabled successfully." };
};

export const disableTwoFactor = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) return;

  const parsed = twoFactorDisableSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyMutationRequest(parsed.data.csrf))) return;

  await db.update(adminUsers).set({ twoFactorEnabled: false, updatedAt: new Date() }).where(eq(adminUsers.id, user.id));
  await db.delete(adminTwoFactorSecrets).where(eq(adminTwoFactorSecrets.userId, user.id));
  await audit({ userId: user.id, action: "2fa_disabled", entityType: "auth" });
  revalidatePath("/admin");
};

export const deletePasskey = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) return;
  const parsed = deletePasskeySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyMutationRequest(parsed.data.csrf))) return;

  await db.delete(adminAuthenticators).where(and(eq(adminAuthenticators.id, parsed.data.authenticatorId), eq(adminAuthenticators.userId, user.id)));
  await audit({ userId: user.id, action: "passkey_deleted", entityType: "authenticator", entityId: parsed.data.authenticatorId });
  revalidatePath("/admin");
};
