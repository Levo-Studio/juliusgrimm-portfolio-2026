import { and, asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projectLinks, projects, projectTechStack } from "@/server/db/schema";
import type { Project } from "@/types/project";
import type { ColorCategory } from "@/types/project";
import { getProjectMonthSortKey } from "@/lib/project-meta";

const fallbackProjects: Project[] = [
  {
    id: "fallback-0",
    slug: "juliusgrimm-portfolio-2025",
    title: "Julius Grimm Portfolio 2025",
    subtitle: "The old one, before this one became a full-time obsession.",
    description:
      "My 2025 portfolio showcasing projects, case studies, and design philosophy. Built as a fast React/Vite experience with animated social links, rich media sections, and responsive layouts.",
    whyBuilt:
      "I wanted a clean place to show my work without the usual template noise, so I built a portfolio that mixed UI/UX presentation with developer-level control over performance and motion.",
    imageUrl: null,
    visible: true,
    sortOrder: 0,
    techStack: [
      { id: "f0t1", label: "React", colorCategory: "green", sortOrder: 1 },
      { id: "f0t2", label: "Vite", colorCategory: "green", sortOrder: 2 },
      { id: "f0t3", label: "React Router", colorCategory: "green", sortOrder: 3 },
      { id: "f0t4", label: "Framer Motion", colorCategory: "blue", sortOrder: 4 },
      { id: "f0t5", label: "CSS Modules", colorCategory: "orange", sortOrder: 5 },
      { id: "f0t6", label: "ESLint", colorCategory: "orange", sortOrder: 6 }
    ],
    links: [
      { id: "f0l1", label: "2025.juliusgrimm.dev", url: "https://2025.juliusgrimm.dev", visible: true, sortOrder: 1 },
      { id: "f0l2", label: "GitHub", url: "https://github.com/Levo-Studio/juliusgrimm-portfolio-2025-2", visible: true, sortOrder: 2 }
    ]
  },
  {
    id: "fallback-1",
    slug: "levo-studio-tickets",
    title: "Levo Studio Tickets",
    subtitle: "Slightly overengineered customer support.",
    description:
      "A modern ticketing and client support platform built for handling projects, requests, and the kind of quick changes that are never actually quick.",
    whyBuilt:
      "Client communication turns chaotic fast when everything lives in email threads and DMs. I built this so support chaos stays structured, searchable, and less painful.",
    imageUrl: null,
    visible: true,
    sortOrder: 1,
    techStack: [
      { id: "f1t1", label: "Next.js", colorCategory: "green", sortOrder: 1 },
      { id: "f1t2", label: "TypeScript", colorCategory: "green", sortOrder: 2 },
      { id: "f1t3", label: "PostgreSQL", colorCategory: "green", sortOrder: 3 },
      { id: "f1t4", label: "Docker", colorCategory: "orange", sortOrder: 4 }
    ],
    links: []
  },
  {
    id: "fallback-2",
    slug: "levo-studio-db-controller",
    title: "Levo Studio DB Controller",
    subtitle: "Self-hosted database chaos, but with buttons.",
    description:
      "An internal database management tool for creating, managing, and monitoring project databases from one clean dashboard.",
    whyBuilt:
      "Managing multiple self-hosted databases manually gets annoying fast. This controller turns repetitive setup into buttons instead of late-night SSH rituals.",
    imageUrl: null,
    visible: true,
    sortOrder: 2,
    techStack: [
      { id: "f2t1", label: "Next.js", colorCategory: "green", sortOrder: 1 },
      { id: "f2t2", label: "TypeScript", colorCategory: "green", sortOrder: 2 },
      { id: "f2t3", label: "PostgreSQL", colorCategory: "green", sortOrder: 3 },
      { id: "f2t4", label: "Docker", colorCategory: "orange", sortOrder: 4 },
      { id: "f2t5", label: "Coolify", colorCategory: "orange", sortOrder: 5 }
    ],
    links: []
  },
  {
    id: "fallback-3",
    slug: "levo-studio-finance",
    title: "Levo Studio Finance",
    subtitle: "Accounting, but slightly less depressing.",
    description:
      "A simple internal finance dashboard for tracking invoices, retainers, expenses, revenue, and the emotional damage caused by admin work.",
    whyBuilt:
      "Spreadsheets are fine until they become a second job. I wanted one place that shows cashflow reality without pretending Excel is a personality.",
    imageUrl: null,
    visible: true,
    sortOrder: 3,
    techStack: [
      { id: "f3t1", label: "Next.js", colorCategory: "green", sortOrder: 1 },
      { id: "f3t2", label: "TypeScript", colorCategory: "green", sortOrder: 2 },
      { id: "f3t3", label: "PostgreSQL", colorCategory: "green", sortOrder: 3 },
      { id: "f3t4", label: "Tailwind", colorCategory: "green", sortOrder: 4 }
    ],
    links: []
  },
  {
    id: "fallback-4",
    slug: "vibevote",
    title: "VibeVote",
    subtitle: "Built because paper forms felt primitive.",
    description:
      "A modern Spotify requesting platform to replace paper song requests, chaotic aux handovers, and social disasters around music control.",
    whyBuilt:
      "Most party request systems still involve paper or passing around phones. I built this to make requests fast, collaborative, and slightly less emotionally damaging.",
    imageUrl: null,
    visible: true,
    sortOrder: 4,
    techStack: [
      { id: "f4t1", label: "React", colorCategory: "green", sortOrder: 1 },
      { id: "f4t2", label: "TypeScript", colorCategory: "green", sortOrder: 2 },
      { id: "f4t3", label: "Next.js", colorCategory: "green", sortOrder: 3 },
      { id: "f4t4", label: "PostgreSQL", colorCategory: "green", sortOrder: 4 }
    ],
    links: [{ id: "f4l1", label: "vibevote.de", url: "https://vibevote.de", visible: true, sortOrder: 1 }]
  },
  {
    id: "fallback-5",
    slug: "orbitaly",
    title: "Orbitaly",
    subtitle: "Messenger encryption paranoia, so I built my own.",
    description:
      "A self-hosted Matrix onboarding platform built because trusting random messenger stacks felt reckless. Orbitaly turns Matrix client setup into a flow that normal people can finish without rage quitting.",
    whyBuilt:
      "I was paranoid about messenger encryption and onboarding complexity, so I built Orbitaly to make secure Matrix client onboarding as easy as possible while keeping everything under my own control.",
    imageUrl: null,
    visible: true,
    sortOrder: 5,
    techStack: [
      { id: "f5t1", label: "Next.js", colorCategory: "green", sortOrder: 1 },
      { id: "f5t2", label: "TypeScript", colorCategory: "green", sortOrder: 2 },
      { id: "f5t3", label: "PostgreSQL", colorCategory: "green", sortOrder: 3 },
      { id: "f5t4", label: "Matrix", colorCategory: "blue", sortOrder: 4 },
      { id: "f5t5", label: "Docker", colorCategory: "orange", sortOrder: 5 }
    ],
    links: [
      { id: "f5l1", label: "orbitaly.de", url: "https://orbitaly.de", visible: true, sortOrder: 1 },
      { id: "f5l2", label: "GitHub", url: "https://github.com/levo-studio/orbitaly", visible: true, sortOrder: 2 }
    ]
  }
];

export const getVisibleProjects = async (): Promise<Project[]> => {
  const sortByTimeline = (items: Project[]): Project[] =>
    [...items].sort((a, b) => {
      const dateA = getProjectMonthSortKey(a.slug);
      const dateB = getProjectMonthSortKey(b.slug);
      if (dateA !== dateB) return dateB - dateA;
      return a.title.localeCompare(b.title, "en", { sensitivity: "base" });
    });

  try {
    const rows = await db.select().from(projects).where(eq(projects.visible, true)).orderBy(asc(projects.sortOrder));
    return Promise.all(rows.map((row) => getProjectBySlug(row.slug))).then((items) =>
      sortByTimeline(items.filter((item): item is Project => item !== null))
    );
  } catch {
    return sortByTimeline(fallbackProjects);
  }
};

export const getProjectBySlug = async (slug: string): Promise<Project | null> => {
  try {
    const [project] = await db.select().from(projects).where(and(eq(projects.slug, slug), eq(projects.visible, true))).limit(1);
    if (!project) return null;

    const tech = await db.select().from(projectTechStack).where(eq(projectTechStack.projectId, project.id)).orderBy(asc(projectTechStack.sortOrder));
    const links = await db.select().from(projectLinks).where(eq(projectLinks.projectId, project.id)).orderBy(asc(projectLinks.sortOrder));

    return {
      ...project,
      techStack: tech.map((item) => ({ ...item, colorCategory: item.colorCategory as ColorCategory })),
      links
    };
  } catch {
    const fallback = fallbackProjects.find((project) => project.slug === slug) ?? null;
    return fallback;
  }
};
