import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projectLinks, projects, projectTechStack } from "@/server/db/schema";
import { getSessionUser } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { DirectProjectImage } from "@/components/shared/direct-project-image";
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
    <main className="min-h-screen bg-black p-6 text-white md:p-8">
      <AdminReveal className="mx-auto max-w-[980px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-inria text-3xl">Edit Case Study</h1>
          <div className="flex items-center gap-2">
            <Button form="project-edit-form" className="border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B] transition hover:bg-[rgba(91,227,139,0.2)]">Save changes</Button>
            <Link href="/admin?tab=case-studies"><Button className="border border-white/25">Back</Button></Link>
          </div>
        </div>
        {error ? <div className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] px-4 py-3 text-sm text-[#E35B5B]">{error}</div> : null}

        <form id="project-edit-form" action={upsertProject} className="grid gap-3 border border-white/15 bg-[#070707] p-5">
          <input type="hidden" name="csrf" value={csrfToken} />
          <input type="hidden" name="id" value={project.id} />

          <label className="text-sm text-white/70">Slug</label>
          <input name="slug" defaultValue={project.slug} className="border border-white/20 bg-black px-3 py-2" />

          <label className="text-sm text-white/70">Title</label>
          <input name="title" defaultValue={project.title} className="border border-white/20 bg-black px-3 py-2" />

          <label className="text-sm text-white/70">Subtitle</label>
          <input name="subtitle" defaultValue={project.subtitle} className="border border-white/20 bg-black px-3 py-2" />

          <label className="text-sm text-white/70">Description</label>
          <textarea name="description" defaultValue={project.description} className="min-h-32 border border-white/20 bg-black px-3 py-2" />

          <label className="text-sm text-white/70">Why built it</label>
          <textarea name="whyBuilt" defaultValue={project.whyBuilt} className="min-h-32 border border-white/20 bg-black px-3 py-2" />

          <label className="text-sm text-white/70">Title image URL (shown on homepage cards)</label>
          <input name="imageUrl" defaultValue={project.imageUrl ?? ""} className="border border-white/20 bg-black px-3 py-2" />
          <div className="relative mt-1 aspect-[1200/630] w-full overflow-hidden border border-white/15 bg-[#151618]">
            {project.imageUrl ? (
              <DirectProjectImage src={project.imageUrl} alt={`${project.title} title image preview`} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">No title image yet</div>
            )}
          </div>

          <label className="text-sm text-white/70">Month / year</label>
          <input
            name="createdAt"
            defaultValue={project.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
            placeholder="May 2026"
            className="border border-white/20 bg-black px-3 py-2"
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
            <input type="checkbox" name="visible" value="true" defaultChecked={project.visible} className="size-4 accent-[#5BE38B]" />
            Visible on homepage
          </label>

          <Button className="justify-self-start border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B] transition hover:bg-[rgba(91,227,139,0.2)]">Save changes</Button>
        </form>
      </AdminReveal>
    </main>
  );
}
