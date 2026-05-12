import Link from "next/link";
import { ArrowUpRight, Square } from "lucide-react";
import { SectionShell } from "@/components/shared/section-shell";
import { ColorTag } from "@/components/shared/color-tag";
import { HeroCodeCloud } from "@/components/sections/hero-code-cloud";
import { HomeAnimations } from "@/components/sections/home-animations";
import { HomeReloadFix } from "@/components/sections/home-reload-fix";
import { AboutReveal } from "@/components/sections/about-reveal";
import { ProjectThumb } from "@/components/shared/project-thumb";
import { HeroTypewriter } from "@/components/sections/hero-typewriter";
import { contactItems, survivalTags } from "@/lib/content";
import { getVisibleProjects } from "@/server/projects";
import { getProjectMonthLabel } from "@/lib/project-meta";

const getGitHubLastUpdate = async (): Promise<string> => {
  const formatDate = (value: Date): string =>
    value.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\./g, "-");

  try {
    const response = await fetch("https://api.github.com/repos/Levo-Studio/juliusgrimm-portfolio-2026/commits?per_page=1", {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "juliusgrimm-portfolio-2026" },
      next: { revalidate: 3600 }
    });
    if (!response.ok) return formatDate(new Date());
    const payload = (await response.json()) as Array<{ commit?: { author?: { date?: string } } }>;
    const commitDate = payload[0]?.commit?.author?.date;
    if (!commitDate) return formatDate(new Date());
    const date = new Date(commitDate);
    return formatDate(date);
  } catch {
    return formatDate(new Date());
  }
};

export const Homepage = async (): Promise<React.JSX.Element> => {
  const projects = await getVisibleProjects();
  const lastUpdated = await getGitHubLastUpdate();
  const currentYear = new Date().getFullYear();
  const contactLinks: Record<string, string> = {
    EMAIL: "mailto:me@juliusgrimm.dev",
    WhatsApp: "tel:+4917661028522",
    Matrix: "https://matrix.to/#/@levostudio:chat.orbitaly.de",
    LinkedIn: "https://linkedin.com/in/julius-gr/",
    Instagram: "https://instagram.com/julius_gr_",
    GitHub: "https://github.com/justthatrandomcoder"
  };

  return (
    <main className="relative bg-black px-7 pb-36 pt-12 text-white md:px-16 md:pb-28 md:pt-12 lg:px-16">
      <HomeAnimations />
      <HomeReloadFix />
      <div className="mx-auto max-w-[1320px]">
        <section className="relative flex min-h-[100svh] items-center overflow-hidden md:min-h-screen">
          <HeroCodeCloud />
          <div className="relative z-10">
            <p data-hero-sub className="font-instrument text-[22px] text-white/85 md:text-[31px]">@julius_gr_</p>
            <HeroTypewriter />
            <Link data-hero-cta href="https://levo-studio.com" target="_blank" className="mt-10 inline-flex items-center gap-3 rounded-none border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] px-5 py-3 font-inria text-[17px] text-[#5BE38B] shadow-none transition duration-200 ease-out hover:scale-[1.02] hover:bg-[rgba(91,227,139,0.18)] hover:shadow-none focus-visible:outline-none focus-visible:ring-0 md:min-w-[240px] md:text-[14px]">
              <Square className="size-3 fill-[#5BE38B] text-[#5BE38B] md:size-4" />
              @levo_studio
            </Link>
          </div>
        </section>

        <div className="space-y-28 md:space-y-32">
          <SectionShell label="ABOUT ME" className="md:mt-8" >
            <AboutReveal />
          </SectionShell>

          <SectionShell label="PROJECTS" className="md:mt-8">
            <h2 className="mb-7 font-instrument text-[38px] leading-[1.08] md:text-[52px]">
              A collection of <span className="text-[#5BE38B]">overengineered ideas.</span>
            </h2>
            <div className="grid max-w-[1020px] grid-cols-1 gap-x-4 gap-y-14 md:grid-cols-2 md:gap-y-20">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="group transition-transform duration-200 ease-out hover:scale-[1.01]" data-card>
                  <div data-card-thumb>
                    <ProjectThumb title={project.title} imageUrl={project.imageUrl} />
                  </div>
                  <p className="mt-5 font-inria text-[12px] uppercase tracking-[0.05em] text-white/60 md:text-[11px]">
                    {getProjectMonthLabel(project.createdAt)}
                  </p>
                  <h3 data-card-title className="mt-1 font-inria text-[24px] md:text-[20px]">{project.title}</h3>
                  <p data-card-subtitle className="font-instrument text-[26px] leading-[1.08] text-[#5BE38B] md:text-[22px]">{project.subtitle}</p>
                </Link>
              ))}
            </div>
          </SectionShell>

          <SectionShell label="TECH STACK" className="md:mt-8">
            <h2 className="mb-7 font-instrument text-[38px] leading-[1.08] md:text-[52px]">
              My current <span className="text-[#5BE38B]">survival kit.</span>
            </h2>
            <div data-tech-wrap className="flex flex-wrap gap-3 md:gap-4">
              {survivalTags.map((tag) => (
                <ColorTag key={tag.label} label={tag.label} color={tag.color} />
              ))}
            </div>
            <div className="mt-9 space-y-3 font-inria text-[15px] md:text-[26px]">
              <p className="flex items-center gap-3 whitespace-nowrap text-[#5BE38B]"><span className="inline-block size-3 shrink-0 bg-[#5BE38B]" />Things causing compiling errors.</p>
              <p className="flex items-center gap-3 whitespace-nowrap text-[#E3AD5B]"><span className="inline-block size-3 shrink-0 bg-[#E3AD5B]" />Daily damage control.</p>
              <p className="flex items-center gap-3 whitespace-nowrap text-[#E35B5B]"><span className="inline-block size-3 shrink-0 bg-[#E35B5B]" />Root access and emotional damage.</p>
              <p className="flex items-center gap-3 whitespace-nowrap text-[#5B76E3]"><span className="inline-block size-3 shrink-0 bg-[#5B76E3]" />Real-world side quests.</p>
            </div>
          </SectionShell>

          <SectionShell label="STILL HERE?" className="md:mt-8">
            <h2 className="mb-7 font-instrument text-[38px] leading-[1.08] md:text-[52px]">
              One more side project <span className="text-[#5BE38B]">won&apos;t hurt.</span>
            </h2>
            <div data-contact-wrap className="mt-14 grid grid-cols-1 gap-x-20 gap-y-16 md:mt-14 md:grid-cols-2 md:gap-y-18">
              {contactItems.map((item) => (
                <div key={item.title} data-contact-card>
                  <p className="font-inria text-[16px] text-white md:text-[16px]">{item.title}</p>
                  <Link
                    href={contactLinks[item.title]}
                    target="_blank"
                    className="group mt-2 inline-flex items-center gap-2 font-inria text-[27px] md:text-[28px]"
                  >
                    {item.value}
                    <ArrowUpRight className="size-5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:size-[18px]" />
                  </Link>
                  <p className="mt-1 font-instrument text-[20px] leading-[1.12] text-[#5BE38B] md:text-[20px]">{item.note}</p>
                </div>
              ))}
            </div>
          </SectionShell>

          <SectionShell label="OTHER INFO" className="md:mt-8">
            <div data-footer-wrap className="font-inria text-[20px] md:text-[18px]">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.2fr_1.8fr] md:items-start md:gap-10">
                <p>© {currentYear} Julius Grimm</p>
                <p>Made with ❤️ and 47 open tabs.</p>
                <p className="text-[#5BE38B]">Last touched: {lastUpdated}</p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-3">
                <Link className="inline-flex items-center gap-2 underline" href="https://github.com/Levo-Studio/juliusgrimm-portfolio-2026" target="_blank">
                  Source code <ArrowUpRight className="size-4" />
                </Link>
                <Link className="inline-flex items-center gap-2 underline" href="/impressum">
                  Legal stuff to keep this running <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </SectionShell>
        </div>
      </div>
    </main>
  );
};
