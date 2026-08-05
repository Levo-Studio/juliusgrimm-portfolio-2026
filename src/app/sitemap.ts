import type { MetadataRoute } from "next";
import { getVisibleProjects } from "@/server/projects";

const baseUrl = "https://juliusgrimm.dev";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const projects = await getVisibleProjects();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2
    }
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.createdAt ? new Date(project.createdAt) : now,
    changeFrequency: "monthly",
    priority: project.slug === "juliusgrimm-portfolio-2025" ? 0.6 : 0.8
  }));

  return [...staticRoutes, ...projectRoutes];
}
