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
    <main className="min-h-screen bg-bg text-fg">
      <AdminReveal className="min-h-screen">
        <form id="project-edit-form" action={upsertProject}>
          <input type="hidden" name="csrf" value={csrfToken} />
          <input type="hidden" name="id" value={project.id} />
          {/* Title images are gone from the site — project rows carry the site's own
              favicon instead. The stored value rides along as a hidden field so
              saving here does not wipe a column the form no longer edits. */}
          <input type="hidden" name="imageUrl" value={project.imageUrl ?? ""} />

          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-[18px] md:px-8">
            <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">
              <Link href="/admin?tab=case-studies" className="transition-colors hover:text-fg">
                ← Case studies
              </Link>
              <span className="text-rule">/</span>
              <span className="text-fg">Edit</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Publishing is a header-level decision, not another field in the form. */}
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-fg-muted">
                Published
                <input type="hidden" name="visible" value="false" />
                <input
                  type="checkbox"
                  name="visible"
                  value="true"
                  defaultChecked={project.visible}
                  className="peer sr-only"
                />
                <span className="relative inline-block h-[17px] w-[30px] rounded-full bg-line-field transition-colors peer-checked:bg-accent peer-checked:[&>span]:translate-x-[13px]">
                  <span className="absolute top-0.5 left-0.5 size-[13px] rounded-full bg-bg transition-transform" />
                </span>
              </label>

              <Button className="rounded-md bg-fg px-[13px] py-2 text-[12px] font-medium text-bg">Save</Button>
            </div>
          </header>

          {error ? (
            <div className="border-b border-danger/40 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-5 py-3 text-sm text-danger md:px-8">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex flex-col gap-6 border-line px-5 py-7 md:border-r md:px-8">
              <div className="flex flex-col gap-2">
                <label htmlFor="field-title" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                  Title
                </label>
                <input
                  id="field-title"
                  name="title"
                  defaultValue={project.title}
                  className="border-b border-line-field bg-transparent pt-1 pb-2 text-[24px] tracking-[-0.02em] outline-none focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="field-subtitle" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                  One-liner
                </label>
                <input
                  id="field-subtitle"
                  name="subtitle"
                  defaultValue={project.subtitle}
                  className="border-b border-line bg-transparent pt-1.5 pb-2 text-[14px] text-fg-field outline-none focus:border-accent"
                />
              </div>

              {/* The public page is built from these two sections, so the editor keeps
                  them apart rather than offering one undifferentiated body field. */}
              <div className="flex flex-col gap-2">
                <label htmlFor="field-description" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                  Context
                </label>
                <textarea
                  id="field-description"
                  name="description"
                  defaultValue={project.description}
                  className="min-h-[190px] rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] leading-[1.7] text-fg-field outline-none focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="field-why" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                  Why I built it
                </label>
                <textarea
                  id="field-why"
                  name="whyBuilt"
                  defaultValue={project.whyBuilt}
                  className="min-h-[150px] rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] leading-[1.7] text-fg-field outline-none focus:border-accent"
                />
              </div>
            </div>

            <aside className="flex flex-col gap-[22px] px-5 py-7 md:px-6">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                  Project URL
                </span>
                <ProjectLinksEditor
                  initialLinks={links.map((link) => ({
                    label: link.label,
                    url: link.url,
                    visible: link.visible,
                    sortOrder: link.sortOrder
                  }))}
                />
                <span className="text-[11px] leading-[1.5] text-fg-faint">
                  The first non-repository link supplies the project&apos;s favicon.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="field-slug" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                  Slug
                </label>
                <input
                  id="field-slug"
                  name="slug"
                  defaultValue={project.slug}
                  className="rounded-[7px] border border-line bg-transparent px-2.5 py-2 font-mono text-[12px] text-fg-field outline-none focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="field-date" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                  Date
                </label>
                <input
                  id="field-date"
                  name="createdAt"
                  defaultValue={project.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
                  placeholder="May 2026"
                  className="rounded-[7px] border border-line bg-transparent px-2.5 py-2 font-mono text-[12px] text-fg-field outline-none focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">Stack</span>
                <ProjectTechEditor
                  initialTech={tech.map((item) => ({
                    label: item.label,
                    colorCategory: (item.colorCategory as "green" | "orange" | "red" | "blue") ?? "green",
                    sortOrder: item.sortOrder
                  }))}
                />
              </div>

              <Link
                href={`/projects/${project.slug}`}
                target="_blank"
                className="mt-auto rounded-md border border-line-strong px-3 py-2 text-center text-[12px] text-fg-muted transition-colors hover:border-line-field hover:text-fg"
              >
                Preview public page
              </Link>
            </aside>
          </div>
        </form>
      </AdminReveal>
    </main>
  );
}
