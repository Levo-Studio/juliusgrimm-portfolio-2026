import type { MetadataRoute } from "next";

const baseUrl = "https://juliusgrimm.dev";
const projectSlugs = ["levo-studio-tickets", "levo-studio-db-controller", "levo-studio-finance", "vibevote", "orbitaly", "juliusgrimm-portfolio-2025"];

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
    ...projectSlugs.map((slug) => ({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: slug === "juliusgrimm-portfolio-2025" ? 0.6 : 0.8
    }))
  ];
}
