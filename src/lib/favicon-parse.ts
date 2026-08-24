/** Hosts that must never be reachable through the favicon resolver. */
const BLOCKED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"]);
const BLOCKED_SUFFIXES = [".local", ".internal", ".localhost", ".home.arpa"];

/**
 * The resolver endpoint is public, so a caller could aim it at infrastructure only the
 * server can reach. Bare IPs are refused outright — every legitimate project link is a
 * domain — along with loopback and internal names.
 */
export const publicHttpUrl = (raw: string): URL | null => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTNAMES.has(host)) return null;
  if (BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix))) return null;
  if (!host.includes(".")) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) return null;

  return url;
};

/**
 * Picks the icon a page declares. Prefers a plain rel="icon" at the largest declared
 * size, then an apple-touch-icon — a bigger source scales down cleanly at the 18px the
 * rows render, while an undersized one cannot be recovered.
 */
export const declaredIconHref = (html: string): string | null => {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  let best: { href: string; score: number; area: number } | null = null;

  for (const tag of links) {
    const rel = /\brel\s*=\s*["']?([^"'>]+)/i.exec(tag)?.[1]?.toLowerCase() ?? "";
    const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;

    // rel is a space-separated token list: "shortcut icon", "icon", "apple-touch-icon".
    const tokens = rel.split(/\s+/);
    const isIcon = tokens.includes("icon");
    const isApple = tokens.includes("apple-touch-icon") || tokens.includes("apple-touch-icon-precomposed");
    if (!isIcon && !isApple) continue;

    const sizes = /\bsizes\s*=\s*["']?([^"'>\s]+)/i.exec(tag)?.[1]?.toLowerCase() ?? "";
    const dimension = /(\d+)\s*x\s*(\d+)/.exec(sizes);
    // "any" means a scalable SVG — the best possible source at any render size.
    const area = sizes === "any" ? Number.MAX_SAFE_INTEGER : dimension ? Number(dimension[1]) * Number(dimension[2]) : 0;
    const score = isIcon ? 2 : 1;

    if (!best || score > best.score || (score === best.score && area > best.area)) {
      best = { href, score, area };
    }
  }

  return best?.href ?? null;
};
