import Link from "next/link";
import { SectionShell } from "@/components/shared/section-shell";
import { ProjectIcon } from "@/components/shared/project-icon";
import { SaveScrollLink } from "@/components/shared/save-scroll-link";
import { SiteHeader } from "@/components/sections/site-header";
import { HeroCodeCloud } from "@/components/sections/hero-code-cloud";
import { Reveal } from "@/components/sections/reveal";
import { ScrollToHash } from "@/components/sections/scroll-to-hash";
import { AboutText } from "@/components/sections/about-text";
import { contactItems, levoStudioContactItems, SURVIVAL_KIT_GROUPS } from "@/lib/content";
import { SiteFooter } from "@/components/sections/site-footer";
import { getVisibleProjects } from "@/server/projects";
import { getSurvivalKitTags } from "@/server/survival-kit";
import { getProjectMonthShort } from "@/lib/project-meta";
import { getFaviconUrl, getProjectSiteUrl } from "@/lib/project-icon";

const CONTACT_LINKS: Record<string, string> = {
  EMAIL: "mailto:me@juliusgrimm.dev",
  WhatsApp: "tel:+4917661028522",
  LinkedIn: "https://linkedin.com/in/julius-gr/",
  Instagram: "https://instagram.com/julius_gr_",
  GitHub: "https://github.com/justthatrandomcoder"
};

const LEVO_STUDIO_LINKS: Record<string, string> = {
  Website: "https://levo-studio.com",
  EMAIL: "mailto:julius@levo-studio.com",
  LinkedIn: "https://www.linkedin.com/company/115850202",
  Instagram: "https://www.instagram.com/levo_studio/",
  GitHub: "https://github.com/levo-studio/"
};

const Tag = ({ label }: { label: string }): React.JSX.Element => (
  <span className="rounded-[5px] border border-line-strong px-[11px] py-2 text-[13px] leading-none md:py-[7px]">
    {label}
  </span>
);

export const Homepage = async (): Promise<React.JSX.Element> => {
  const projects = await getVisibleProjects();
  const survivalTags = await getSurvivalKitTags();

  return (
    <main className="flex min-h-screen flex-col bg-bg text-fg">
      <Reveal />
      <ScrollToHash />
      <SiteHeader />

      <section data-reveal className="relative overflow-hidden px-[22px] pt-14 pb-15 md:px-14 md:pt-[92px] md:pb-25">
        <HeroCodeCloud />
        <div className="relative">
          <p className="mb-5 text-[10px] font-medium leading-none text-accent md:mb-7 md:text-[11px]">
            @julius_gr_
          </p>
          <h1 className="m-0 max-w-[15ch] text-[34px] font-light leading-[1.14] tracking-[-0.022em] md:text-[54px] md:leading-[1.12] md:tracking-[-0.024em]">
            Founder on accident. <span className="text-fg-muted">Engineer by design.</span>
          </h1>
          <p className="mt-[22px] text-[12px] leading-none text-fg-muted md:mt-[30px] md:text-[13px]">
            Julius Grimm ·{" "}
            <Link
              href="https://levo-studio.com"
              target="_blank"
              rel="noreferrer"
              className="text-accent transition-opacity hover:opacity-70"
            >
              @levo-studio
            </Link>
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-12 px-[22px] pb-10 md:gap-21 md:px-14 md:pb-19">
        {/* No reveal: the one line about who this is should not wait on a scroll. */}
        <SectionShell id="about" label="About" reveal={false}>
          <AboutText>
            {"I'm Julius — founder, developer, and *professional overthinker.* I build fast digital products with an *unhealthy attention to detail* and a tendency to *overengineer things* that worked fine before. Everything I build ends up being a *side project,* solving my own problems in ways that cost more effort than doing them by hand, but *that's the catch,* and I'm *down for every one.*"}
          </AboutText>
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
                <SaveScrollLink
                  key={project.id}
                  id={`project-${project.slug}`}
                  data-row
                  href={`/projects/${project.slug}`}
                  className="row-link grid grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-3 border-b border-line px-1 py-[13px] md:py-[15px] md:pr-[14px] md:pl-3 lg:grid-cols-[18px_250px_minmax(0,1fr)_78px] lg:items-center lg:gap-[18px]"
                >
                  <span className="mt-0.5 lg:mt-0">
                    <ProjectIcon src={favicon} title={project.title} size={18} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1 lg:contents">
                    <span className="truncate text-[14px] leading-[1.25] md:text-[15px] md:leading-[1.3]">
                      {project.title}
                    </span>
                    <span className="text-[12px] leading-[1.35] text-fg-muted md:text-[13px] md:leading-[1.3] lg:truncate">
                      {project.subtitle}
                    </span>
                  </span>
                  <span className="mt-[3px] font-mono text-[10px] leading-none text-fg-faint md:text-[11px] lg:mt-0 lg:text-right">
                    {month}
                  </span>
                </SaveScrollLink>
              );
            })}
          </div>
        </SectionShell>

        <SectionShell id="stack" label="Stack">
          <div className="flex flex-col gap-5 md:gap-[26px]">
            {SURVIVAL_KIT_GROUPS.map((group) => {
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
                className="row-link flex flex-col gap-[5px] border-b border-line px-1 py-[13px] md:px-3 md:py-3.5 lg:grid lg:grid-cols-[96px_250px_minmax(0,1fr)] lg:items-baseline lg:gap-[18px]"
              >
                <span className="flex items-baseline justify-between gap-3 lg:contents">
                  <span className="order-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-fg-muted md:text-[10px] lg:order-none">
                    {item.title}
                  </span>
                  <span className="order-1 text-[14px] lg:order-none lg:whitespace-nowrap">{item.value}</span>
                </span>
                <span className="text-[12px] leading-[1.35] text-fg-muted">{item.note}</span>
              </Link>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="levo-studio" label="Levo Studio">
          <h2 className="m-0 mb-[18px] text-[22px] font-light leading-[1.25] tracking-[-0.02em] md:mb-6 md:text-[26px] md:leading-[1.2]">
            Where the side projects get a business card.
          </h2>
          <div className="flex flex-col border-t border-line">
            {levoStudioContactItems.map((item) => (
              <Link
                key={item.title}
                data-row
                href={LEVO_STUDIO_LINKS[item.title]}
                target="_blank"
                rel="noreferrer"
                className="row-link flex flex-col gap-[5px] border-b border-line px-1 py-[13px] md:px-3 md:py-3.5 lg:grid lg:grid-cols-[96px_250px_minmax(0,1fr)] lg:items-baseline lg:gap-[18px]"
              >
                <span className="flex items-baseline justify-between gap-3 lg:contents">
                  <span className="order-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-fg-muted md:text-[10px] lg:order-none">
                    {item.title}
                  </span>
                  <span className="order-1 text-[14px] lg:order-none lg:whitespace-nowrap">{item.value}</span>
                </span>
                <span className="text-[12px] leading-[1.35] text-fg-muted">{item.note}</span>
              </Link>
            ))}
          </div>
        </SectionShell>
      </div>

      <SiteFooter />
    </main>
  );
};
