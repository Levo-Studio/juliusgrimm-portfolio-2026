import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projectLinks, projects, projectTechStack } from "@/server/db/schema";

const main = async (): Promise<void> => {
  const [project] = await db
    .insert(projects)
    .values({
      slug: "juliusgrimm-portfolio-2025",
      title: "Julius Grimm Portfolio 2025",
      subtitle: "The old one, before this one became a full-time obsession.",
      description:
        "My 2025 portfolio website showcasing selected work, skills, and design philosophy as a developer and UI/UX designer. Built for speed and modern UX with rich case-study style storytelling.",
      whyBuilt:
        "I wanted one place that felt personal and fast, so I built it with React and Vite, added smooth motion, and turned static project showcases into a more narrative portfolio experience.",
      sortOrder: 6,
      visible: true
    })
    .onConflictDoUpdate({
      target: projects.slug,
      set: {
        title: "Julius Grimm Portfolio 2025",
        subtitle: "The old one, before this one became a full-time obsession.",
        description:
          "My 2025 portfolio website showcasing selected work, skills, and design philosophy as a developer and UI/UX designer. Built for speed and modern UX with rich case-study style storytelling.",
        whyBuilt:
          "I wanted one place that felt personal and fast, so I built it with React and Vite, added smooth motion, and turned static project showcases into a more narrative portfolio experience.",
        sortOrder: 6,
        visible: true,
        updatedAt: new Date()
      }
    })
    .returning();

  await db.delete(projectTechStack).where(eq(projectTechStack.projectId, project.id));
  await db.delete(projectLinks).where(eq(projectLinks.projectId, project.id));

  await db.insert(projectTechStack).values([
    { projectId: project.id, label: "React", colorCategory: "green", sortOrder: 1 },
    { projectId: project.id, label: "Vite", colorCategory: "green", sortOrder: 2 },
    { projectId: project.id, label: "React Router", colorCategory: "green", sortOrder: 3 },
    { projectId: project.id, label: "Framer Motion", colorCategory: "blue", sortOrder: 4 },
    { projectId: project.id, label: "CSS Modules", colorCategory: "orange", sortOrder: 5 },
    { projectId: project.id, label: "Custom CSS", colorCategory: "orange", sortOrder: 6 },
    { projectId: project.id, label: "ESLint", colorCategory: "orange", sortOrder: 7 }
  ]);

  await db.insert(projectLinks).values([
    { projectId: project.id, label: "2025.juliusgrimm.dev", url: "https://2025.juliusgrimm.dev", visible: true, sortOrder: 1 },
    { projectId: project.id, label: "GitHub", url: "https://github.com/Levo-Studio/juliusgrimm-portfolio-2025-2", visible: true, sortOrder: 2 }
  ]);

  console.log("Portfolio 2025 upserted:", project.id);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

