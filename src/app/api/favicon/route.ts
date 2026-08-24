import { NextResponse } from "next/server";
import { declaredIconHref, publicHttpUrl } from "@/lib/favicon-parse";

/**
 * Resolves a project's real favicon.
 *
 * Sites do not agree on where their icon lives — /favicon.ico is a convention, not a
 * rule — so this reads what the page actually declares in <link rel="icon"> and only
 * falls back to /favicon.ico when nothing is declared. The browser cannot do this
 * itself: reading another origin's HTML is blocked by CORS.
 *
 * Speed comes from caching, not from guessing: the HTML lookup goes through Next's
 * fetch cache and the response carries a long public Cache-Control, so a given domain
 * is fetched for real about once a day and served from cache in between.
 */

const HTML_TIMEOUT_MS = 4000;
const ICON_TIMEOUT_MS = 4000;
const MAX_HTML_BYTES = 256 * 1024;
const MAX_ICON_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const DAY = 86_400;

const fetchWithTimeout = async (url: string, ms: number, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "manual",
      headers: { "User-Agent": "juliusgrimm.dev favicon resolver", ...(init?.headers ?? {}) }
    });
  } finally {
    clearTimeout(timer);
  }
};

/** Follows redirects by hand so every hop is re-checked, not just the first. */
const fetchFollowing = async (start: URL, ms: number, init?: RequestInit): Promise<Response | null> => {
  let current: URL | null = start;
  for (let hop = 0; hop <= MAX_REDIRECTS && current; hop += 1) {
    const response: Response = await fetchWithTimeout(current.toString(), ms, init);
    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get("location");
    if (!location) return response;
    current = publicHttpUrl(new URL(location, current).toString());
  }
  return null;
};

const readCapped = async (response: Response, cap: number): Promise<Uint8Array | null> => {
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (declared > cap) return null;

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > cap) return null;
  return new Uint8Array(buffer);
};

const notFound = (): NextResponse =>
  // Cached too: a site without a usable icon should not be re-fetched on every view.
  new NextResponse(null, {
    status: 404,
    headers: { "Cache-Control": `public, max-age=${DAY}, stale-while-revalidate=${DAY * 7}` }
  });

export const GET = async (request: Request): Promise<NextResponse> => {
  const target = new URL(request.url).searchParams.get("u");
  if (!target) return notFound();

  const site = publicHttpUrl(target);
  if (!site) return notFound();

  // Resolve which URL the icon lives at, cached by Next for a day.
  let iconUrl: URL | null = null;
  try {
    const page = await fetchFollowing(new URL(site.origin), HTML_TIMEOUT_MS, {
      headers: { Accept: "text/html" },
      next: { revalidate: DAY }
    } as RequestInit);

    if (page?.ok && (page.headers.get("content-type") ?? "").includes("html")) {
      const body = await readCapped(page, MAX_HTML_BYTES);
      const href = body ? declaredIconHref(new TextDecoder().decode(body).slice(0, MAX_HTML_BYTES)) : null;
      if (href) iconUrl = publicHttpUrl(new URL(href, page.url || site.origin).toString());
    }
  } catch {
    /* fall through to the conventional path */
  }

  if (!iconUrl) iconUrl = publicHttpUrl(new URL("/favicon.ico", site.origin).toString());
  if (!iconUrl) return notFound();

  try {
    const icon = await fetchFollowing(iconUrl, ICON_TIMEOUT_MS, {
      headers: { Accept: "image/*" },
      next: { revalidate: DAY }
    } as RequestInit);
    if (!icon?.ok) return notFound();

    const type = icon.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return notFound();

    const bytes = await readCapped(icon, MAX_ICON_BYTES);
    if (!bytes || bytes.byteLength === 0) return notFound();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": `public, max-age=${DAY}, stale-while-revalidate=${DAY * 7}`,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox"
      }
    });
  } catch {
    return notFound();
  }
};
