import { cookies } from "next/headers";
import { desc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminSessions, projects } from "@/server/db/schema";
import { getSessionUser } from "@/server/auth";
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
      <main className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
        <AdminLoginForm csrfToken={csrfToken} />
      </main>
    );
  }

  const allProjects = await db.select().from(projects).orderBy(projects.sortOrder);
  const sessions = await db.select().from(adminSessions).orderBy(desc(adminSessions.createdAt));
  const initialTab = params.tab === "settings" ? "settings" : params.tab === "overview" ? "overview" : "case-studies";
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

  return <AdminDashboard csrfToken={csrfToken} projects={allProjects} sessions={sessions} initialTab={initialTab} saved={saved} errorMessage={errorMessage} />;
}
