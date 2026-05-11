"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { and, count, eq, isNull } from "drizzle-orm";
import { authenticator } from "otplib";
import { db } from "@/server/db/client";
import { adminSessions, adminTwoFactorSecrets, adminUsers, projectLinks, projects, projectTechStack } from "@/server/db/schema";
import { audit, clearSession, createSession, getSessionUser, hashPassword, rateLimitAuth, verifyCsrfToken, verifyPassword } from "@/server/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  csrf: z.string().optional(),
  twoFactorCode: z.string().optional()
});

export type LoginState = { ok: boolean; error?: string; requiresTwoFactor?: boolean };

export const loginAdmin = async (_prevState: LoginState, formData: FormData): Promise<LoginState> => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    csrf: formData.get("csrf"),
    twoFactorCode: formData.get("twoFactorCode")
  });

  if (!parsed.success) return { ok: false, error: "Please use a valid email and a password with at least 12 characters." };
  if (parsed.data.csrf && !(await verifyCsrfToken(parsed.data.csrf))) return { ok: false, error: "Session expired. Please reload /admin and try again." };
  if (!rateLimitAuth(parsed.data.email)) return { ok: false, error: "Too many login attempts. Please wait a few minutes." };

  try {
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(adminUsers);
    if (totalUsers === 0) {
      const [createdUser] = await db
        .insert(adminUsers)
        .values({
          email: parsed.data.email,
          passwordHash: await hashPassword(parsed.data.password),
          role: "admin"
        })
        .returning();

      await createSession(createdUser.id);
      await audit({ userId: createdUser.id, action: "first_admin_created", entityType: "auth", metadata: createdUser.email });
      await audit({ userId: createdUser.id, action: "login", entityType: "auth" });
      revalidatePath("/admin");
      redirect("/admin");
    }

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      await audit({ action: "failed_login", entityType: "auth", metadata: parsed.data.email });
      return { ok: false, error: "Invalid credentials." };
    }

    if (user.twoFactorEnabled) {
      const code = (parsed.data.twoFactorCode ?? "").replace(/\D/g, "");
      if (code.length !== 6) return { ok: false, requiresTwoFactor: true, error: "Enter your 2FA code." };

      const [secret] = await db.select().from(adminTwoFactorSecrets).where(eq(adminTwoFactorSecrets.userId, user.id)).limit(1);
      if (!secret || !authenticator.check(code, secret.secretEncrypted)) {
        await audit({ userId: user.id, action: "failed_login_2fa", entityType: "auth" });
        return { ok: false, requiresTwoFactor: true, error: "Invalid 2FA code." };
      }
    }

    await createSession(user.id);
    await audit({ userId: user.id, action: "login", entityType: "auth" });
    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    console.error("Admin login/create failed:", error);
    return { ok: false, error: "Could not create/login admin user. Check database permissions and schema." };
  }
};

export const logoutAdmin = async (): Promise<void> => {
  const user = await getSessionUser();
  if (user) await audit({ userId: user.id, action: "logout", entityType: "auth" });
  await clearSession();
  revalidatePath("/admin");
  redirect("/admin");
};

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2),
  title: z.string().min(2),
  subtitle: z.string().min(2),
  description: z.string().min(10),
  whyBuilt: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal("")),
  visible: z.enum(["true", "false"]),
  sortOrder: z.coerce.number().int(),
  csrf: z.string().optional()
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
  if (parsed.data.csrf && !(await verifyCsrfToken(parsed.data.csrf))) {
    redirect(`/admin/projects/${rawId}?error=csrf`);
  }
  if (!parsed.data.id) {
    redirect("/admin?tab=case-studies&error=missing-id");
  }

  await db
    .update(projects)
    .set({
      slug: parsed.data.slug,
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

  await audit({ userId: user.id, action: parsed.data.visible === "true" ? "project_edit" : "project_hide_show", entityType: "project", entityId: parsed.data.id });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/projects/${parsed.data.slug}`);
  redirect("/admin?tab=case-studies&saved=1");
};

const toggleSchema = z.object({ id: z.string().uuid(), visible: z.enum(["true", "false"]), csrf: z.string().min(8) });

export const toggleProjectVisibility = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) return;
  const parsed = toggleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyCsrfToken(parsed.data.csrf))) return;

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
  if (csrf && !(await verifyCsrfToken(csrf))) redirect("/admin?tab=case-studies&error=csrf");

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

const sessionSchema = z.object({ sessionId: z.string().uuid(), csrf: z.string().min(8) });

export const revokeSession = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) return;
  const parsed = sessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyCsrfToken(parsed.data.csrf))) return;

  await db.update(adminSessions).set({ revokedAt: new Date() }).where(and(eq(adminSessions.id, parsed.data.sessionId), isNull(adminSessions.revokedAt)));
  await audit({ userId: user.id, action: "session_revoke", entityType: "session", entityId: parsed.data.sessionId });
  revalidatePath("/admin");
};

const passwordSchema = z.object({ currentPassword: z.string().min(12), newPassword: z.string().min(12), confirmPassword: z.string().min(12), csrf: z.string().min(8) });

export type PasswordState = { ok: boolean; error?: string; message?: string };

export const changePassword = async (_prev: PasswordState, formData: FormData): Promise<PasswordState> => {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyCsrfToken(parsed.data.csrf))) return { ok: false, error: "Invalid form submission." };
  if (parsed.data.newPassword !== parsed.data.confirmPassword) return { ok: false, error: "New passwords do not match." };

  const [dbUser] = await db.select().from(adminUsers).where(eq(adminUsers.id, user.id)).limit(1);
  if (!dbUser) return { ok: false, error: "User not found." };
  if (!(await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash))) return { ok: false, error: "Current password is incorrect." };

  await db.update(adminUsers).set({ passwordHash: await hashPassword(parsed.data.newPassword), updatedAt: new Date() }).where(eq(adminUsers.id, user.id));
  await audit({ userId: user.id, action: "password_change", entityType: "auth" });
  return { ok: true, message: "Password updated." };
};
