import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import { SectionShell } from "@/components/shared/section-shell";
import { ColorTag } from "@/components/shared/color-tag";
import { CaseStudyAnimations } from "@/components/sections/case-study-animations";
import { getProjectBySlug } from "@/server/projects";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const accentBySlug: Record<string, string[]> = {
  vibevote: [
    "replace paper song requests, chaotic aux handovers, and the social disaster",
    "involve paper lists, screenshots, or passing around a phone every three minutes",
    "live music requests into something fast, collaborative, and slightly less emotionally damaging"
  ],
  "levo-studio-tickets": ["quick changes", "support chaos into structured chaos"],
  "levo-studio-db-controller": ["self-hosted Neon/Supabase-style control panel", "SSH into production and pray"],
  "levo-studio-finance": ["painful realization that business is mostly admin", "without pretending Excel is a lifestyle"]
};

const withAccent = (text: string, accents: string[]): React.ReactNode => {
  if (accents.length === 0) return text;
  const escaped = accents.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, index) =>
    accents.some((accent) => accent.toLowerCase() === part.toLowerCase()) ? (
      <span key={`${part}-${index}`} className="text-[#5BE38B]">
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
};

export default async function ProjectDetailPage({ params }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const accents = accentBySlug[project.slug] ?? [];

  return (
    <main className="min-h-screen bg-black px-7 pb-36 pt-14 text-white md:flex md:items-center md:px-16 md:py-16 lg:px-[64px]">
      <CaseStudyAnimations />
      <div className="mx-auto w-full max-w-[1320px] space-y-16">
        <SectionShell label="DESCRIPTION">
          <h1 data-case-heading className="font-instrument text-[30px] leading-[1.03] md:text-[46px]">
            {project.title} <span className="text-[#5BE38B]">{project.subtitle}</span>
          </h1>
          <p data-case-body className="mt-9 max-w-[1080px] font-instrument text-[20px] leading-[1.14] md:text-[34px]">
            {withAccent(project.description, accents)}
          </p>
        </SectionShell>

        <SectionShell label="WHY I BUILD IT">
          <p data-case-body className="max-w-[1080px] font-instrument text-[20px] leading-[1.14] md:text-[34px]">
            {withAccent(project.whyBuilt, accents)}
          </p>
        </SectionShell>

        <SectionShell label="TECH STACK">
          <div className="flex flex-wrap gap-4">
            {project.techStack.map((tech) => (
              <ColorTag key={tech.id} label={tech.label} color={(tech.colorCategory as "green" | "orange" | "red" | "blue") ?? "green"} />
            ))}
          </div>
        </SectionShell>

        {project.links.some((link) => link.visible) ? (
          <SectionShell label="LINKS">
            <div className="flex flex-wrap gap-4">
              {project.links.filter((link) => link.visible).map((link) => (
                <Link key={link.id} href={link.url} target="_blank" className="inline-flex items-center gap-3 border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] px-6 py-4 font-inria text-[16px] text-[#5BE38B] md:text-[14px]">
                  <Globe className="size-5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </SectionShell>
        ) : null}

        <Link data-case-back href="/" className="inline-block font-inria text-[20px] underline underline-offset-4 md:text-[20px]">
          ← BACK
        </Link>
      </div>
    </main>
  );
}
