import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth";
import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen bg-bg p-6 text-fg md:p-8">
      <AdminReveal className="mx-auto max-w-[980px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Add Case Study</h1>
          <div className="flex items-center gap-2">
            <Link href="/admin?tab=case-studies"><Button className="border border-line-strong">Back</Button></Link>
            <CreateSubmitButton className="border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]">Create case study</CreateSubmitButton>
          </div>
        </div>
        {error ? <div className="border border-danger bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-3 text-sm text-danger">{error}</div> : null}

        <AiCaseStudyGenerator csrf={csrfToken} model={env.MISTRAL_MODEL ?? "mistral-large-latest"} />

        <form id="project-create-form" action={createProject} className="grid gap-3 border border-line-strong bg-[#070707] p-5">
          <input type="hidden" name="csrf" value={csrfToken} />

          <CaseStudyFields />

          <label className="text-sm text-fg-muted">Month / year</label>
          <input name="createdAt" placeholder="May 2026" className="border border-line-strong bg-bg px-3 py-2" />

          <input type="hidden" name="visible" value="false" />
          <label className="inline-flex items-center gap-3 text-sm">
            <input type="checkbox" name="visible" value="true" defaultChecked className="size-4 accent-[var(--accent)]" />
            Visible on homepage
          </label>

          <ProjectLinksEditor initialLinks={[]} />
          <ProjectTechEditor initialTech={[]} />

          <CreateSubmitButton className="justify-self-start border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]">Create case study</CreateSubmitButton>
        </form>
      </AdminReveal>
    </main>
  );
}
