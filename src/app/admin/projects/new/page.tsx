import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth";
import { createProject } from "@/app/admin/actions";
import { ProjectLinksEditor } from "@/app/admin/projects/project-links-editor";
import { ProjectTechEditor } from "@/app/admin/projects/project-tech-editor";
import { AiCaseStudyGenerator } from "@/app/admin/projects/ai-case-study-generator";
import { env } from "@/lib/env";
import { CaseStudyFields } from "@/app/admin/projects/case-study-fields";
import { CreateSubmitButton } from "@/app/admin/projects/create-submit-button";
import { AdminReveal } from "@/app/admin/admin-reveal";

type Search = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const LABEL = "font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted";

export default async function AdminProjectCreatePage({ searchParams }: Search): Promise<React.JSX.Element> {
  const user = await getSessionUser();
  if (!user) notFound();

  const sp = await searchParams;
  const csrfToken = (await cookies()).get("admin_csrf")?.value ?? "";
  const error =
    sp.error === "csrf"
      ? "Session expired. Please go back and try again."
      : sp.error === "invalid-form"
        ? "Please check all required fields. Title, subtitle, description and why-built text are required."
        : sp.error === "slug-conflict"
          ? "Could not create case study because the slug already exists. Please try a different slug."
          : sp.error === "create-failed"
            ? "Could not create case study due to a server/database error. Please retry in a moment."
            : undefined;

  return (
    <main className="min-h-screen bg-bg text-fg">
      <AdminReveal className="min-h-screen">
        <form id="project-create-form" action={createProject}>
          <input type="hidden" name="csrf" value={csrfToken} />

          {/* Same shell as the edit screen: breadcrumb left, state and the one
              committing action right. */}
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-[18px] md:px-8">
            <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">
              <Link href="/admin?tab=case-studies" className="transition-colors hover:text-fg">
                ← Case studies
              </Link>
              <span className="text-rule">/</span>
              <span className="text-fg">New</span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-fg-muted">
                Published
                <input type="hidden" name="visible" value="false" />
                <input type="checkbox" name="visible" value="true" defaultChecked className="peer sr-only" />
                <span className="relative inline-block h-[17px] w-[30px] rounded-full bg-line-field transition-colors peer-checked:bg-accent peer-checked:[&>span]:translate-x-[13px]">
                  <span className="absolute top-0.5 left-0.5 size-[13px] rounded-full bg-bg transition-transform" />
                </span>
              </label>

              <CreateSubmitButton>Create</CreateSubmitButton>
            </div>
          </header>

          {error ? (
            <div className="border-b border-danger/40 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-5 py-3 text-sm text-danger md:px-8">
              {error}
            </div>
          ) : null}

          {/* The generator sits above the form it fills, so the relationship between
              the prompt and the fields below is visible rather than implied. */}
          <div className="border-b border-line px-5 py-6 md:px-8">
            <AiCaseStudyGenerator csrf={csrfToken} model={env.MISTRAL_MODEL ?? "mistral-large-latest"} />
          </div>

          <CaseStudyFields
            sidebarBefore={
              <div className="flex flex-col gap-2">
                <span className={LABEL}>Project URL</span>
                <ProjectLinksEditor initialLinks={[]} />
                <span className="text-[11px] leading-[1.5] text-fg-faint">
                  The first non-repository link supplies the project&apos;s favicon.
                </span>
              </div>
            }
            sidebarAfter={
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="new-date" className={LABEL}>
                    Date
                  </label>
                  <input
                    id="new-date"
                    name="createdAt"
                    placeholder="May 2026"
                    className="rounded-[7px] border border-line bg-transparent px-2.5 py-2 font-mono text-[12px] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className={LABEL}>Stack</span>
                  <ProjectTechEditor initialTech={[]} />
                </div>
              </>
            }
          />
        </form>
      </AdminReveal>
    </main>
  );
}
