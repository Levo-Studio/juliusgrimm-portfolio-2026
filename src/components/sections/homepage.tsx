import Link from "next/link";
import { SectionShell } from "@/components/shared/section-shell";
import { ProjectIcon } from "@/components/shared/project-icon";
import { SiteHeader } from "@/components/sections/site-header";
import { HeroCodeCloud } from "@/components/sections/hero-code-cloud";
import { Reveal } from "@/components/sections/reveal";
import { contactItems } from "@/lib/content";
import { getVisibleProjects } from "@/server/projects";
import { getSurvivalKitTags } from "@/server/survival-kit";
import { getProjectMonthShort } from "@/lib/project-meta";
import { getFaviconUrl, getProjectSiteUrl } from "@/lib/project-icon";
import type { ColorCategory } from "@/types/project";

const CONTACT_LINKS: Record<string, string> = {
  EMAIL: "mailto:me@juliusgrimm.dev",
  WhatsApp: "tel:+4917661028522",
  LinkedIn: "https://linkedin.com/in/julius-gr/",
  Instagram: "https://instagram.com/julius_gr_",
  GitHub: "https://github.com/justthatrandomcoder"
};

/**
 * One captioned group per colour category. The design file mocks only two
 * captions, but the survival kit is authored in four — collapsing them buried the
 * side quests among the operating systems.
 */
const STACK_GROUPS: { caption: string; color: ColorCategory }[] = [
  { caption: "Things causing compiling errors.", color: "green" },
  { caption: "Daily damage control.", color: "orange" },
  { caption: "Root access and emotional damage.", color: "red" },
  { caption: "Real-world side quests.", color: "blue" }
];

const Tag = ({ label }: { label: string }): React.JSX.Element => (
  <span className="rounded-[5px] border border-line-strong px-[11px] py-2 text-[13px] leading-none md:py-[7px]">
    {label}
  </span>
);

export const Homepage = async (): Promise<React.JSX.Element> => {
  const projects = await getVisibleProjects();
  const survivalTags = await getSurvivalKitTags();
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-bg text-fg">
      <Reveal />
      <SiteHeader />

      <section data-reveal className="relative overflow-hidden px-[22px] pt-14 pb-15 md:px-14 md:pt-[92px] md:pb-25">
        <HeroCodeCloud />
        <div className="relative">
          <p className="mb-5 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.14em] text-accent md:mb-7 md:text-[11px]">
            @julius_gr_
          </p>
          <h1 className="m-0 max-w-[15ch] text-[34px] font-light leading-[1.14] tracking-[-0.022em] md:text-[54px] md:leading-[1.12] md:tracking-[-0.024em]">
            Founder on accident. <span className="text-fg-muted">Engineer by design.</span>
          </h1>
          <p className="mt-[22px] text-[12px] leading-none text-fg-muted md:mt-[30px] md:text-[13px]">
            Julius Grimm ·{" "}
            <Link href="https://levo-studio.com" target="_blank" rel="noreferrer" className="text-accent">
              @levo_studio
            </Link>
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-12 px-[22px] pb-10 md:gap-21 md:px-14 md:pb-19">
        {/* No reveal: the one line about who this is should not wait on a scroll. */}
        <SectionShell id="about" label="About" reveal={false}>
          <p className="m-0 max-w-[56ch] text-[15px] leading-[1.6] text-pretty md:text-[17px] md:leading-[1.62]">
            I&apos;m Julius — founder, developer, and professional overthinker. I build fast digital products with an
            unhealthy attention to detail and a tendency to overengineer things that worked fine before.
          </p>
        </SectionShell>

        <SectionShell id="projects" label="Projects">
          <p className="m-0 mb-4 text-[12px] leading-none text-fg-muted md:mb-[22px] md:text-[13px]">
            A collection of overengineered ideas.
          </p>
          <div className="flex flex-col border-t border-line">
            {projects.map((project) => {
              const favicon = getFaviconUrl(getProjectSiteUrl(project.links));
              const month = getProjectMonthShort(project.createdAt);
              return (
                <Link
                  key={project.id}
                  data-row
                  href={`/projects/${project.slug}`}
                  className="row-link grid grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-3 border-b border-line px-1 py-[13px] md:grid-cols-[18px_250px_minmax(0,1fr)_78px] md:items-center md:gap-[18px] md:py-[15px] md:pr-[14px] md:pl-3"
                >
                  <span className="mt-0.5 md:mt-0">
                    <ProjectIcon src={favicon} title={project.title} size={18} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1 md:contents">
                    <span className="truncate text-[14px] leading-[1.25] md:text-[15px] md:leading-[1.3]">
                      {project.title}
                    </span>
                    <span className="text-[12px] leading-[1.35] text-fg-muted md:truncate md:text-[13px] md:leading-[1.3]">
                      {project.subtitle}
                    </span>
                  </span>
                  <span className="mt-[3px] font-mono text-[10px] leading-none text-fg-faint md:mt-0 md:text-right md:text-[11px]">
                    {month}
                  </span>
                </Link>
              );
            })}
          </div>
        </SectionShell>

        <SectionShell id="stack" label="Stack">
          <div className="flex flex-col gap-5 md:gap-[26px]">
            {STACK_GROUPS.map((group) => {
              const tags = survivalTags.filter((tag) => tag.color === group.color);
              if (tags.length === 0) return null;
              return (
                <div key={group.caption}>
                  <p className="mb-2.5 text-[12px] leading-none text-fg-muted md:mb-3">{group.caption}</p>
                  <div className="flex flex-wrap gap-[7px] md:gap-2">
                    {tags.map((tag) => (
                      <Tag key={tag.label} label={tag.label} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionShell>

        <SectionShell id="contact" label="Contact">
          <h2 className="m-0 mb-[18px] text-[22px] font-light leading-[1.25] tracking-[-0.02em] md:mb-6 md:text-[26px] md:leading-[1.2]">
            One more side project won&apos;t hurt.
          </h2>
          <div className="flex flex-col border-t border-line">
            {contactItems.map((item) => (
              <Link
                key={item.title}
                data-row
                href={CONTACT_LINKS[item.title]}
                target="_blank"
                rel="noreferrer"
                className="row-link flex flex-col gap-[5px] border-b border-line px-1 py-[13px] md:grid md:grid-cols-[96px_250px_minmax(0,1fr)] md:items-baseline md:gap-[18px] md:px-3 md:py-3.5"
              >
                <span className="flex items-baseline justify-between gap-3 md:contents">
                  <span className="order-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-fg-muted md:order-none md:text-[10px]">
                    {item.title}
                  </span>
                  <span className="order-1 text-[14px] md:order-none md:whitespace-nowrap">{item.value}</span>
                </span>
                <span className="text-[12px] leading-[1.35] text-fg-muted">{item.note}</span>
              </Link>
            ))}
          </div>
        </SectionShell>
      </div>

      <footer className="flex flex-col gap-2 border-t border-line px-[22px] py-[18px] font-mono text-[10px] leading-[1.7] text-fg-faint md:flex-row md:items-center md:justify-between md:px-14 md:py-[22px] md:text-[11px] md:leading-[1.6]">
        <span>© {currentYear} Julius Grimm · Made with ❤️ and 47 open tabs.</span>
        <span className="flex gap-[18px]">
          <Link href="https://github.com/Levo-Studio/juliusgrimm-portfolio-2026" target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">
            Source code
          </Link>
          <Link href="/impressum" className="transition-colors hover:text-fg">
            Legal notice
          </Link>
        </span>
      </footer>
    </main>
  );
};
