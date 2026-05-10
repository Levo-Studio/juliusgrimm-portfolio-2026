import { cookies } from "next/headers";
import { desc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminSessions, projects } from "@/server/db/schema";
import { getSessionUser } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { loginAdmin, logoutAdmin, revokeSession, upsertProject } from "./actions";

export default async function AdminPage(): Promise<React.JSX.Element> {
  const user = await getSessionUser();
  const csrfToken = (await cookies()).get("admin_csrf")?.value ?? "";

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
        <form action={loginAdmin} className="w-full max-w-md space-y-4 border border-white/20 p-6">
          <h1 className="font-inria text-2xl">Admin Login</h1>
          <input type="hidden" name="csrf" value={csrfToken} />
          <Input name="email" type="email" required placeholder="admin@email.com" />
          <Input name="password" type="password" required placeholder="************" />
          <Button className="w-full">Sign in</Button>
        </form>
      </main>
    );
  }

  const allProjects = await db.select().from(projects).orderBy(projects.sortOrder);
  const sessions = await db.select().from(adminSessions).orderBy(desc(adminSessions.createdAt));

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-inria">Admin</h1>
        <form action={logoutAdmin}>
          <Button variant="ghost">Logout</Button>
        </form>
      </div>

      <section className="space-y-6">
        {allProjects.map((project) => (
          <form key={project.id} action={upsertProject} className="grid gap-2 border border-white/15 p-4">
            <input type="hidden" name="csrf" value={csrfToken} />
            <input type="hidden" name="id" value={project.id} />
            <Input name="slug" defaultValue={project.slug} />
            <Input name="title" defaultValue={project.title} />
            <Input name="subtitle" defaultValue={project.subtitle} />
            <Textarea name="description" defaultValue={project.description} />
            <Textarea name="whyBuilt" defaultValue={project.whyBuilt} />
            <Input name="imageUrl" defaultValue={project.imageUrl ?? ""} />
            <Input name="sortOrder" type="number" defaultValue={project.sortOrder} />
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="visible" defaultChecked={project.visible} /> visible
            </label>
            <Button className="justify-self-start">Save</Button>
          </form>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="mb-3 text-xl">Sessions</h2>
        <div className="space-y-3">
          {sessions.map((session) => (
            <form key={session.id} action={revokeSession} className="flex items-center justify-between border border-white/10 p-3">
              <input type="hidden" name="csrf" value={csrfToken} />
              <input type="hidden" name="sessionId" value={session.id} />
              <span className="text-sm">{session.userAgent ?? "unknown"}</span>
              <Button className="border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B]">Revoke</Button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
