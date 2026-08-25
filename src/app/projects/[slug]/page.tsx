import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionShell } from "@/components/shared/section-shell";
import { ProjectIcon } from "@/components/shared/project-icon";
import { HighlightedParagraph } from "@/components/shared/highlighted-paragraph";
import { JsonLd } from "@/components/shared/json-ld";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { Reveal } from "@/components/sections/reveal";
import { getProjectBySlug, getVisibleProjects } from "@/server/projects";
import { getProjectMonthShort } from "@/lib/project-meta";
import { getFaviconUrl, getProjectSiteUrl } from "@/lib/project-icon";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const title = `${project.title} Case Study`;
  const description =
    project.description.length > 155 ? `${project.description.slice(0, 152).trim()}...` : project.description;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${title} | Julius Grimm`,
      description,
      url: `/projects/${project.slug}`,
      type: "article",
      images: [{ url: "/jg_badge.png", width: 1200, height: 630, alt: `${project.title} case study` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Julius Grimm`,
      description,
      images: ["/jg_badge.png"]
    }
  };
};

/** Body copy is stored as prose; blank lines separate paragraphs. */
const paragraphs = (text: string): string[] => text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

export default async function ProjectDetailPage({ params }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await getVisibleProjects();
  const index = all.findIndex((entry) => entry.slug === project.slug);
  // The two that follow, wrapping past the end so the last project still offers a
  // way onward rather than dead-ending.
  const next = index === -1 ? all.slice(0, 2) : [...all.slice(index + 1), ...all.slice(0, index)].slice(0, 2);

  const links = project.links.filter((link) => link.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  const favicon = getFaviconUrl(getProjectSiteUrl(project.links));

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: `${project.title} — ${project.subtitle}`,
    description: project.description,
    url: `https://juliusgrimm.dev/projects/${project.slug}`,
    image: "https://juliusgrimm.dev/jg_badge.png",
    ...(project.createdAt ? { dateCreated: new Date(project.createdAt).toISOString() } : {}),
    keywords: project.techStack.map((tech) => tech.label).join(", "),
    author: { "@type": "Person", name: "Julius Grimm", url: "https://juliusgrimm.dev" }
  };

  return (
    <main className="flex min-h-screen flex-col bg-bg text-fg">
      <JsonLd data={projectSchema} />
      <Reveal />
      <SiteHeader back={{ label: "← All projects", href: `/#project-${project.slug}` }} />

      {/* Label column, logo + date above the title. */}
      <div
        data-reveal
        className="grid grid-cols-1 gap-x-10 gap-y-4 px-[22px] pt-10 pb-8 md:px-14 md:pt-16 md:pb-12 lg:grid-cols-[120px_minmax(0,min(1380px,60vw))]"
      >
        <p className="flex h-[18px] items-center font-mono text-[10px] font-medium uppercase leading-none tracking-[0.16em] text-fg-muted">
          Case study
        </p>
        <div>
          <div className="mb-4 flex h-[18px] items-center gap-[9px] md:mb-[22px] md:gap-2.5">
            <ProjectIcon src={favicon} title={project.title} size={18} />
            <span className="font-mono text-[10px] leading-none tracking-[0.06em] text-fg-faint md:text-[11px]">
              {getProjectMonthShort(project.createdAt)}
            </span>
          </div>
          <h1 className="m-0 mb-2.5 text-[30px] font-light leading-[1.16] tracking-[-0.022em] md:mb-3 md:text-[42px] md:leading-[1.14] md:tracking-[-0.024em]">
            {project.title}
          </h1>
          <p className="m-0 text-[15px] leading-[1.55] text-fg-muted md:text-[17px] md:leading-[1.6]">
            {project.subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-7 px-[22px] pb-10 md:gap-[34px] md:px-14 md:pb-16">
        <SectionShell label="Context" reveal={false} className="lg:grid-cols-[120px_minmax(0,min(1380px,60vw))]">
          <div className="flex flex-col gap-[18px] text-[15px] leading-[1.68] text-fg-body md:text-[16px]">
            {paragraphs(project.description).map((text) => (
              <HighlightedParagraph key={text} className="m-0 text-pretty">
                {text}
              </HighlightedParagraph>
            ))}
          </div>
        </SectionShell>

        <SectionShell label="Why I built it" reveal={false} className="lg:grid-cols-[120px_minmax(0,min(1380px,60vw))]">
          <div className="flex flex-col gap-3.5 text-[15px] leading-[1.68] text-fg-body md:gap-[18px] md:text-[16px]">
            {paragraphs(project.whyBuilt).map((text) => (
              <HighlightedParagraph key={text} className="m-0 text-pretty">
                {text}
              </HighlightedParagraph>
            ))}
          </div>
        </SectionShell>

        {project.techStack.length > 0 ? (
          <SectionShell label="Stack" reveal={false}>
            <div className="flex flex-wrap gap-[7px] md:gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech.id}
                  className="rounded-[5px] border border-line-strong px-[11px] py-2 text-[13px] leading-none md:py-[7px]"
                >
                  {tech.label}
                </span>
              ))}
            </div>
          </SectionShell>
        ) : null}

        {links.length > 0 ? (
          <SectionShell label="Links" reveal={false}>
            {/* The project's own site leads in the accent; everything after it is secondary. */}
            <div className="flex flex-col gap-2.5 text-[14px] md:flex-row md:gap-[22px]">
              {links.map((link, position) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={position === 0 ? "text-accent" : "text-fg-muted transition-colors hover:text-fg"}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SectionShell>
        ) : null}

        {next.length > 0 ? (
          <SectionShell label="Next" reveal={false}>
            <div className="flex flex-col border-t border-line">
              {next.map((entry) => (
                <Link
                  key={entry.id}
                  data-row
                  href={`/projects/${entry.slug}`}
                  className="row-link grid grid-cols-[16px_minmax(0,1fr)] items-start gap-3 border-b border-line px-1 py-[13px] md:grid-cols-[18px_200px_minmax(0,1fr)] md:items-center md:gap-[18px] md:py-[15px] md:pr-[14px] md:pl-3"
                >
                  <span className="mt-0.5 md:mt-0">
                    <ProjectIcon src={getFaviconUrl(getProjectSiteUrl(entry.links))} title={entry.title} size={18} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1 md:contents">
                    <span className="truncate text-[14px] leading-[1.25] md:text-[15px]">{entry.title}</span>
                    <span className="truncate text-[12px] leading-[1.35] text-fg-muted md:text-[13px]">
                      {entry.subtitle}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </SectionShell>
        ) : null}
      </div>

      <SiteFooter />
    </main>
  );
}
