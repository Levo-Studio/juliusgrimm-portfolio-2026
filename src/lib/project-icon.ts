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
 * Points at the resolver route rather than guessing a path. /favicon.ico is only a
 * convention — plenty of sites declare their icon somewhere else entirely — and the
 * browser cannot read another origin's HTML to find out, so the lookup happens
 * server-side and the result is cached hard on the way back.
 */
export const getFaviconUrl = (siteUrl: string | null): string | null => {
  if (!siteUrl) return null;
  try {
    return `/api/favicon?u=${encodeURIComponent(new URL(siteUrl).origin)}`;
  } catch {
    return null;
  }
};
