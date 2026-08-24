import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projectLinks, projects, projectTechStack } from "@/server/db/schema";
import { getSessionUser } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { upsertProject } from "@/app/admin/actions";
import { ProjectLinksEditor } from "@/app/admin/projects/project-links-editor";
import { ProjectTechEditor } from "@/app/admin/projects/project-tech-editor";
import { AdminReveal } from "@/app/admin/admin-reveal";

type Props = { params: Promise<{ id: string }> };

type Search = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProjectEditPage({ params, searchParams }: Props & Search): Promise<React.JSX.Element> {
  const user = await getSessionUser();
  if (!user) notFound();

  const { id } = await params;
  const sp = await searchParams;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) notFound();
  const links = await db.select().from(projectLinks).where(eq(projectLinks.projectId, project.id)).orderBy(asc(projectLinks.sortOrder));
  const tech = await db.select().from(projectTechStack).where(eq(projectTechStack.projectId, project.id)).orderBy(asc(projectTechStack.sortOrder));
  const csrfToken = (await cookies()).get("admin_csrf")?.value ?? "";
  const error =
    sp.error === "csrf"
      ? "Session expired. Please go back and try again."
      : sp.error === "invalid-form"
        ? "Please check all required fields."
        : undefined;

  return (
    <main className="min-h-screen bg-bg p-6 text-fg md:p-8">
      <AdminReveal className="mx-auto max-w-[980px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Edit Case Study</h1>
          <div className="flex items-center gap-2">
            <Button form="project-edit-form" className="border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent transition hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]">Save changes</Button>
            <Link href="/admin?tab=case-studies"><Button className="border border-line-strong">Back</Button></Link>
          </div>
        </div>
        {error ? <div className="border border-danger bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-3 text-sm text-danger">{error}</div> : null}

        <form id="project-edit-form" action={upsertProject} className="grid gap-3 border border-line-strong bg-[#070707] p-5">
          <input type="hidden" name="csrf" value={csrfToken} />
          <input type="hidden" name="id" value={project.id} />

          <label className="text-sm text-fg-muted">Slug</label>
          <input name="slug" defaultValue={project.slug} className="border border-line-strong bg-bg px-3 py-2" />

          <label className="text-sm text-fg-muted">Title</label>
          <input name="title" defaultValue={project.title} className="border border-line-strong bg-bg px-3 py-2" />

          <label className="text-sm text-fg-muted">Subtitle</label>
          <input name="subtitle" defaultValue={project.subtitle} className="border border-line-strong bg-bg px-3 py-2" />

          <label className="text-sm text-fg-muted">Description</label>
          <textarea name="description" defaultValue={project.description} className="min-h-32 border border-line-strong bg-bg px-3 py-2" />

          <label className="text-sm text-fg-muted">Why built it</label>
          <textarea name="whyBuilt" defaultValue={project.whyBuilt} className="min-h-32 border border-line-strong bg-bg px-3 py-2" />

          {/* Title images are gone from the site — project rows carry the site's own
              favicon instead. The stored value rides along as a hidden field so
              saving here does not wipe a column the form no longer edits. */}
          <input type="hidden" name="imageUrl" value={project.imageUrl ?? ""} />

          <label className="text-sm text-fg-muted">Month / year</label>
          <input
            name="createdAt"
            defaultValue={project.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
            placeholder="May 2026"
            className="border border-line-strong bg-bg px-3 py-2"
          />

          <ProjectLinksEditor
            initialLinks={links.map((link) => ({
              label: link.label,
              url: link.url,
              visible: link.visible,
              sortOrder: link.sortOrder
            }))}
          />
          <ProjectTechEditor
            initialTech={tech.map((item) => ({
              label: item.label,
              colorCategory: (item.colorCategory as "green" | "orange" | "red" | "blue") ?? "green",
              sortOrder: item.sortOrder
            }))}
          />

          <input type="hidden" name="visible" value="false" />
          <label className="inline-flex items-center gap-3 text-sm">
            <input type="checkbox" name="visible" value="true" defaultChecked={project.visible} className="size-4 accent-[var(--accent)]" />
            Visible on homepage
          </label>

          <Button className="justify-self-start border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent transition hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]">Save changes</Button>
        </form>
      </AdminReveal>
    </main>
  );
}
