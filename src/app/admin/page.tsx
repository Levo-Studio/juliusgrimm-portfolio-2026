import { cookies } from "next/headers";
import { and, asc, desc, eq, gt, inArray, isNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminAuthenticators, adminSessions, adminUsers, projectLinks, projects } from "@/server/db/schema";
import { getSessionUser } from "@/server/auth";
import { getSurvivalKitTags } from "@/server/survival-kit";
import { getFaviconUrl, getProjectSiteUrl } from "@/lib/project-icon";
import { AdminLoginForm } from "./admin-login-form";
import { AdminDashboard } from "./admin-dashboard";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: Props): Promise<React.JSX.Element> {
  const params = await searchParams;
  const user = await getSessionUser();
  const csrfToken = (await cookies()).get("admin_csrf")?.value ?? "";

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg p-8 text-fg">
        <AdminLoginForm />
      </main>
    );
  }

  const allProjects = await db.select().from(projects).orderBy(projects.createdAt);
  const projectIds = allProjects.map((project) => project.id);
  const allLinks = projectIds.length
    ? await db.select().from(projectLinks).where(inArray(projectLinks.projectId, projectIds)).orderBy(asc(projectLinks.sortOrder))
    : [];
  const linksByProject = new Map<string, typeof allLinks>();
  for (const link of allLinks) {
    const list = linksByProject.get(link.projectId) ?? [];
    list.push(link);
    linksByProject.set(link.projectId, list);
  }
  const projectsWithIcons = allProjects.map((project) => ({
    ...project,
    faviconUrl: getFaviconUrl(getProjectSiteUrl(linksByProject.get(project.id) ?? []))
  }));
  const survivalTags = await getSurvivalKitTags();
  const sessions = await db
    .select()
    .from(adminSessions)
    .where(and(isNull(adminSessions.revokedAt), gt(adminSessions.expiresAt, new Date())))
    .orderBy(desc(adminSessions.createdAt));
  const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.id, user.id)).limit(1);
  const passkeys = await db
    .select({ id: adminAuthenticators.id, createdAt: adminAuthenticators.createdAt, lastUsedAt: adminAuthenticators.lastUsedAt, deviceType: adminAuthenticators.deviceType })
    .from(adminAuthenticators)
    .where(eq(adminAuthenticators.userId, user.id))
    .orderBy(desc(adminAuthenticators.createdAt));
  // Case studies is the only landing worth having: the dashboard summarised a list
  // you could simply be looking at.
  const initialTab = params.tab === "settings" ? "settings" : params.tab === "survival-kit" ? "survival-kit" : "case-studies";
  const saved = params.saved === "1";
  const errorParam = typeof params.error === "string" ? params.error : "";
  const errorMessage =
    errorParam === "csrf"
      ? "Session expired. Please try again."
      : errorParam === "invalid-form"
        ? "Could not save: please check all required fields."
        : errorParam === "missing-id"
          ? "Could not save: project id missing."
          : undefined;

  return (
    <AdminDashboard
      csrfToken={csrfToken}
      projects={projectsWithIcons}
      survivalTags={survivalTags}
      sessions={sessions}
      passkeys={passkeys}
      twoFactorEnabled={adminUser?.twoFactorEnabled ?? false}
      initialTab={initialTab}
      saved={saved}
      errorMessage={errorMessage}
    />
  );
}
