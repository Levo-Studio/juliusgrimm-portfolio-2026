"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminSessions, adminUsers, projectLinks, projects, projectTechStack } from "@/server/db/schema";
import { audit, clearSession, createSession, getSessionUser, hashPassword, rateLimitAuth, verifyCsrfToken, verifyPassword } from "@/server/auth";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(12), csrf: z.string().min(8) });

export const loginAdmin = async (formData: FormData): Promise<void> => {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    csrf: formData.get("csrf")
  });
  if (!parsed.success || !(await verifyCsrfToken(parsed.data.csrf))) return;
  if (!rateLimitAuth(parsed.data.email)) return;

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
    return;
  }

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await audit({ action: "failed_login", entityType: "auth", metadata: parsed.data.email });
    return;
  }

  await createSession(user.id);
  await audit({ userId: user.id, action: "login", entityType: "auth" });
  revalidatePath("/admin");
};

export const logoutAdmin = async (): Promise<void> => {
  const user = await getSessionUser();
  if (user) await audit({ userId: user.id, action: "logout", entityType: "auth" });
  await clearSession();
  revalidatePath("/admin");
};

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2),
  title: z.string().min(2),
  subtitle: z.string().min(2),
  description: z.string().min(10),
  whyBuilt: z.string().min(10),
  imageUrl: z.string().url().optional().or(z.literal("")),
  visible: z.coerce.boolean(),
  sortOrder: z.coerce.number().int(),
  csrf: z.string().min(8)
});

export const upsertProject = async (formData: FormData): Promise<void> => {
  const user = await getSessionUser();
  if (!user) return;

  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success || !(await verifyCsrfToken(parsed.data.csrf))) return;

  if (parsed.data.id) {
    await db
      .update(projects)
      .set({
        slug: parsed.data.slug,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle,
        description: parsed.data.description,
        whyBuilt: parsed.data.whyBuilt,
        imageUrl: parsed.data.imageUrl || null,
        visible: parsed.data.visible,
        sortOrder: parsed.data.sortOrder,
        updatedAt: new Date()
      })
      .where(eq(projects.id, parsed.data.id));

    await audit({ userId: user.id, action: parsed.data.visible ? "project_edit" : "project_hide_show", entityType: "project", entityId: parsed.data.id });
  }

  revalidatePath("/");
  revalidatePath("/admin");
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
