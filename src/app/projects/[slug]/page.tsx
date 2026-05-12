import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Globe } from "lucide-react";
import { SectionShell } from "@/components/shared/section-shell";
import { ColorTag } from "@/components/shared/color-tag";
import { CaseStudyAnimations } from "@/components/sections/case-study-animations";
import { getProjectBySlug } from "@/server/projects";
import { getProjectMonthLabel } from "@/lib/project-meta";

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
  "levo-studio-finance": ["painful realization that business is mostly admin", "without pretending Excel is a lifestyle"],
  orbitaly: ["trusting random messenger stacks felt reckless", "secure Matrix client onboarding as easy as possible"],
  "juliusgrimm-portfolio-2025": ["React and Vite", "animated social links", "modern, responsive design"]
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

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const title = `${project.title} Case Study`;
  const description = project.description.length > 155 ? `${project.description.slice(0, 152).trim()}...` : project.description;
  const image = project.imageUrl ?? "/jg_badge.png";

  return {
    title,
    description,
    alternates: {
      canonical: `/projects/${project.slug}`
    },
    openGraph: {
      title: `${title} | Julius Grimm`,
      description,
      url: `/projects/${project.slug}`,
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: `${project.title} case study` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Julius Grimm`,
      description,
      images: [image]
    }
  };
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
          {project.imageUrl ? (
            <div className="mb-8 relative aspect-[1200/630] w-full max-w-[980px] overflow-hidden border border-white/15 bg-[#151618]">
              <Image src={project.imageUrl} alt={`${project.title} OG preview`} fill className="object-cover" sizes="(max-width: 1200px) 100vw, 60vw" />
            </div>
          ) : (
            <div className="crt-loader mb-8 relative aspect-[1200/630] w-full max-w-[980px] overflow-hidden border border-white/15 bg-[#151618]">
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[12px] tracking-[0.18em] text-[#5BE38B] md:text-[13px]">
                NO SIGNAL
              </div>
            </div>
          )}
          <h1 data-case-heading className="font-instrument text-[30px] leading-[1.03] md:text-[46px]">
            {project.title} <span className="text-[#5BE38B]">{project.subtitle}</span>
          </h1>
          <p className="mt-3 font-inria text-[12px] uppercase tracking-[0.06em] text-white/60 md:text-[13px]">
            {getProjectMonthLabel(project.createdAt)}
          </p>
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
                <Link key={link.id} href={link.url} target="_blank" className="inline-flex items-center gap-2.5 border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] px-5 py-2.5 font-inria text-[15px] text-[#5BE38B] transition hover:bg-[rgba(91,227,139,0.2)] md:text-[14px]">
                  <Globe className="size-5" />
                  {link.label}
                  <ArrowUpRight className="size-4" />
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
