import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { createProject } from "@/app/admin/actions";
import { ProjectLinksEditor } from "@/app/admin/projects/project-links-editor";
import { ProjectTechEditor } from "@/app/admin/projects/project-tech-editor";
import { AiCaseStudyGenerator } from "@/app/admin/projects/ai-case-study-generator";
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
    <main className="min-h-screen bg-black p-6 text-white md:p-8">
      <AdminReveal className="mx-auto max-w-[980px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-inria text-3xl">Add Case Study</h1>
          <div className="flex items-center gap-2">
            <CreateSubmitButton className="border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B] hover:bg-[rgba(91,227,139,0.2)]">Create case study</CreateSubmitButton>
            <Link href="/admin?tab=case-studies"><Button className="border border-white/25">Back</Button></Link>
          </div>
        </div>
        {error ? <div className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] px-4 py-3 text-sm text-[#E35B5B]">{error}</div> : null}

        <AiCaseStudyGenerator csrf={csrfToken} />

        <form id="project-create-form" action={createProject} className="grid gap-3 border border-white/15 bg-[#070707] p-5">
          <input type="hidden" name="csrf" value={csrfToken} />

          <CaseStudyFields />

          <label className="text-sm text-white/70">Title image URL (shown on homepage cards)</label>
          <input name="imageUrl" placeholder="https://..." className="border border-white/20 bg-black px-3 py-2" />

          <label className="text-sm text-white/70">Month / year</label>
          <input name="createdAt" placeholder="May 2026" className="border border-white/20 bg-black px-3 py-2" />

          <input type="hidden" name="visible" value="false" />
          <label className="inline-flex items-center gap-3 text-sm">
            <input type="checkbox" name="visible" value="true" defaultChecked className="size-4 accent-[#5BE38B]" />
            Visible on homepage
          </label>

          <ProjectLinksEditor initialLinks={[]} />
          <ProjectTechEditor initialTech={[]} />

          <CreateSubmitButton className="justify-self-start border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B] hover:bg-[rgba(91,227,139,0.2)]">Create case study</CreateSubmitButton>
        </form>
      </AdminReveal>
    </main>
  );
}
