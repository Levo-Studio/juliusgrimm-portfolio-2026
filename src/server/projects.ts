import { and, asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projectLinks, projects, projectTechStack } from "@/server/db/schema";
import type { Project } from "@/types/project";
import type { ColorCategory } from "@/types/project";

const fallbackProjects: Project[] = [
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
  }
];

export const getVisibleProjects = async (): Promise<Project[]> => {
  try {
    const rows = await db.select().from(projects).where(eq(projects.visible, true)).orderBy(asc(projects.sortOrder));
    return Promise.all(rows.map((row) => getProjectBySlug(row.slug))).then((items) => items.filter((item): item is Project => item !== null));
  } catch {
    return fallbackProjects;
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
