import { db } from "@/server/db/client";
import { projectLinks, projects, projectTechStack } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const seedProjects = [
  {
    slug: "juliusgrimm-portfolio-2025",
    title: "Julius Grimm Portfolio 2025",
    subtitle: "The old one, before this one became a full-time obsession.",
    description:
      "My 2025 portfolio website showcasing selected work, skills, and design philosophy as a developer and UI/UX designer. Built for speed and modern UX with rich case-study style storytelling.",
    whyBuilt:
      "I wanted one place that felt personal and fast, so I built it with React and Vite, added smooth motion, and turned static project showcases into a more narrative portfolio experience.",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    tech: ["React", "Vite", "React Router", "Framer Motion", "CSS Modules", "Custom CSS", "ESLint"],
    links: [
      { label: "2025.juliusgrimm.dev", url: "https://2025.juliusgrimm.dev", visible: true },
      { label: "GitHub", url: "https://github.com/Levo-Studio/juliusgrimm-portfolio-2025-2", visible: true }
    ]
  },
  {
    slug: "levo-studio-tickets",
    title: "Levo Studio Tickets",
    subtitle: "Slightly overengineered customer support.",
    description:
      "A modern ticketing and client support platform built for handling projects, requests, and the kind of \"quick changes\" that are never actually quick. Designed to keep communication organized without feeling like enterprise software from 2009.",
    whyBuilt:
      "Client communication can turn into a mess fast when everything lives in emails, DMs, and random notes. I built this to turn support chaos into structured chaos, with tickets, statuses, and a workflow that does not make me want to disappear.",
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
    links: [] as { label: string; url: string; visible: boolean }[]
  },
  {
    slug: "levo-studio-db-controller",
    title: "Levo Studio DB Controller",
    subtitle: "Self-hosted database chaos, but with buttons.",
    description:
      "An internal database management tool built to create, manage, and monitor project databases from one clean dashboard. Basically a tiny self-hosted Neon/Supabase-style control panel, because manually touching PostgreSQL forever sounded painful.",
    whyBuilt:
      "Levo Studio runs multiple projects on self-hosted infrastructure, and managing databases manually gets annoying very quickly. So I built a controller that makes database setup faster, cleaner, and slightly less SSH into production and pray.",
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Docker", "Coolify"],
    links: []
  },
  {
    slug: "levo-studio-finance",
    title: "Levo Studio Finance",
    subtitle: "Accounting, but slightly less depressing.",
    description:
      "A simple internal finance dashboard for tracking invoices, retainers, revenue, expenses, and the painful realization that business is mostly admin with nicer charts.",
    whyBuilt:
      "Spreadsheets work until they start feeling personal. I wanted one clean place to understand revenue, recurring clients, expenses, and cashflow without pretending Excel is a lifestyle.",
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
    links: []
  },
  {
    slug: "vibevote",
    title: "VibeVote",
    subtitle: "Built because paper forms felt primitive.",
    description:
      "A modern Spotify requesting platform built to replace paper song requests, chaotic aux handovers, and the social disaster of letting one person control the music all night.",
    whyBuilt:
      "Most party request systems still somehow involve paper lists, screenshots, or passing around a phone every three minutes. That felt primitive, so I built a system that turns live music requests into something fast, collaborative, and slightly less emotionally damaging.",
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    tech: ["React", "TypeScript", "Next.js", "PostgreSQL"],
    links: [{ label: "vibevote.de", url: "https://vibevote.de", visible: true }]
  },
  {
    slug: "orbitaly",
    title: "Orbitaly",
    subtitle: "Messenger encryption paranoia, so I built my own.",
    description:
      "A self-hosted Matrix onboarding platform built because trusting random messenger stacks felt reckless. Orbitaly turns Matrix client setup into a flow that normal people can finish without rage quitting.",
    whyBuilt:
      "I was paranoid about messenger encryption and onboarding complexity, so I built Orbitaly to make secure Matrix client onboarding as easy as possible while keeping everything under my own control.",
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Matrix", "Docker"],
    links: [
      { label: "orbitaly.de", url: "https://orbitaly.de", visible: true },
      { label: "GitHub", url: "https://github.com/levo-studio/orbitaly", visible: true }
    ]
  }
];

const main = async (): Promise<void> => {
  for (const project of seedProjects) {
    const [inserted] = await db
      .insert(projects)
      .values({
        slug: project.slug,
        title: project.title,
        subtitle: project.subtitle,
        description: project.description,
        whyBuilt: project.whyBuilt,
        createdAt: project.createdAt,
        visible: true
      })
      .onConflictDoUpdate({
        target: projects.slug,
        set: {
          title: project.title,
          subtitle: project.subtitle,
          description: project.description,
          whyBuilt: project.whyBuilt,
          createdAt: project.createdAt,
          updatedAt: new Date()
        }
      })
      .returning();

    await db.delete(projectTechStack).where(eq(projectTechStack.projectId, inserted.id));
    await db.delete(projectLinks).where(eq(projectLinks.projectId, inserted.id));

    await db.insert(projectTechStack).values(
      project.tech.map((label, index) => ({
        projectId: inserted.id,
        label,
        sortOrder: index,
        colorCategory: "green"
      }))
    );

    if (project.links.length > 0) {
      await db.insert(projectLinks).values(
        project.links.map((link, index) => ({
          projectId: inserted.id,
          label: link.label,
          url: link.url,
          visible: link.visible,
          sortOrder: index
        }))
      );
    }
  }
};

main()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
