import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projectLinks, projects, projectTechStack } from "@/server/db/schema";

async function run(): Promise<void> {
  const [project] = await db
    .insert(projects)
    .values({
      slug: "orbitaly",
      title: "Orbitaly",
      subtitle: "Messenger encryption paranoia, so I built my own.",
      description:
        "A self-hosted Matrix onboarding platform built because trusting random messenger stacks felt reckless. Orbitaly turns Matrix client setup into a flow that normal people can finish without rage quitting.",
      whyBuilt:
        "I was paranoid about messenger encryption and onboarding complexity, so I built Orbitaly to make secure Matrix client onboarding as easy as possible while keeping everything under my own control.",
      imageUrl: "https://orbitaly.de/orbitaly-og-image.png",
      visible: true,
      createdAt: new Date("2026-04-01T00:00:00.000Z")
    })
    .onConflictDoUpdate({
      target: projects.slug,
      set: {
        title: "Orbitaly",
        subtitle: "Messenger encryption paranoia, so I built my own.",
        description:
          "A self-hosted Matrix onboarding platform built because trusting random messenger stacks felt reckless. Orbitaly turns Matrix client setup into a flow that normal people can finish without rage quitting.",
        whyBuilt:
          "I was paranoid about messenger encryption and onboarding complexity, so I built Orbitaly to make secure Matrix client onboarding as easy as possible while keeping everything under my own control.",
        imageUrl: "https://orbitaly.de/orbitaly-og-image.png",
        visible: true,
        createdAt: new Date("2026-04-01T00:00:00.000Z"),
        updatedAt: new Date()
      }
    })
    .returning();

  await db.delete(projectTechStack).where(eq(projectTechStack.projectId, project.id));
  await db.delete(projectLinks).where(eq(projectLinks.projectId, project.id));

  await db.insert(projectTechStack).values([
    { projectId: project.id, label: "Next.js", colorCategory: "green", sortOrder: 1 },
    { projectId: project.id, label: "TypeScript", colorCategory: "green", sortOrder: 2 },
    { projectId: project.id, label: "PostgreSQL", colorCategory: "green", sortOrder: 3 },
    { projectId: project.id, label: "Matrix", colorCategory: "blue", sortOrder: 4 },
    { projectId: project.id, label: "Docker", colorCategory: "orange", sortOrder: 5 }
  ]);

  await db.insert(projectLinks).values([
    { projectId: project.id, label: "orbitaly.de", url: "https://orbitaly.de", visible: true, sortOrder: 1 },
    { projectId: project.id, label: "GitHub", url: "https://github.com/levo-studio/orbitaly", visible: true, sortOrder: 2 }
  ]);

  console.log("Orbitaly upserted:", project.id);
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
