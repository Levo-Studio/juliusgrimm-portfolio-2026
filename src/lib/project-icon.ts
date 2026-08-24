import type { ProjectLink } from "@/types/project";

/** Hosts that are never the project's own site, even when listed first. */
const CODE_HOSTS = new Set(["github.com", "www.github.com", "gitlab.com", "www.gitlab.com", "bitbucket.org"]);

/**
 * The project's own website: the first visible link in sort order that is not a
 * repository host. Seed data lists the site first and labels it with its domain
 * ("vibevote.de"), with "GitHub" after it, so ordering alone is usually enough —
 * the host check is what keeps a repo-only project from claiming github.com's
 * favicon as its own.
 */
export const getProjectSiteUrl = (links: ProjectLink[]): string | null => {
  const candidate = links
    .filter((link) => link.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((link) => {
      try {
        return !CODE_HOSTS.has(new URL(link.url).hostname.toLowerCase());
      } catch {
        return false;
      }
    });

  return candidate?.url ?? null;
};

/**
 * The site's own favicon, read straight from its origin on each load. Deliberately
 * not routed through a third-party favicon service: no external dependency sits in
 * the render path, and nothing about the visitor is handed to another host.
 *
 * /favicon.ico is a convention, not a guarantee — a site that only declares its
 * icon via <link rel="icon"> will 404 here. Discovering that would mean fetching
 * and parsing the site's HTML server-side, so instead the miss is absorbed by the
 * caller's fallback tile.
 */
export const getFaviconUrl = (siteUrl: string | null): string | null => {
  if (!siteUrl) return null;
  try {
    return new URL("/favicon.ico", new URL(siteUrl).origin).toString();
  } catch {
    return null;
  }
};
