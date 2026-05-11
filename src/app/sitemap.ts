import type { MetadataRoute } from "next";
import { projectMonthBySlug } from "@/lib/project-meta";

const baseUrl = "https://juliusgrimm.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
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
    },
    ...Object.entries(projectMonthBySlug).map(([slug, month]) => ({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: month.startsWith("2026") ? 0.8 : 0.6
    }))
  ];
}
