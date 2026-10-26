import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy, createNonce, staticSecurityHeaders } from "@/lib/security-headers";

const CSRF_COOKIE = "admin_csrf";

/**
 * Route handlers that send their own, stricter Content-Security-Policy. Next keeps the
 * proxy's value when both set the same header, so the proxy leaves the CSP to them.
 */
const OWN_CSP_PREFIXES = ["/api/favicon"];

export const proxy = (request: NextRequest): NextResponse => {
  const mode = { isDev: process.env.NODE_ENV === "development", isProd: process.env.NODE_ENV === "production" };
  const nonce = createNonce();
  const csp = buildContentSecurityPolicy(nonce, mode);
  const { pathname } = request.nextUrl;

  // First visit to the admin: mint the CSRF cookie and hand it to this very render too,
  // so the forms it renders already carry the token the browser is about to store.
  let csrfToken: string | null = null;
  if (pathname.startsWith("/admin") && !request.cookies.get(CSRF_COOKIE)?.value) {
    csrfToken = crypto.randomUUID().replace(/-/g, "");
    request.cookies.set(CSRF_COOKIE, csrfToken);
  }

  // Next reads the nonce from the request's CSP header and applies it to its own scripts;
  // the layout reads x-nonce for the inline theme script and next/script.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (!OWN_CSP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    response.headers.set("Content-Security-Policy", csp);
  }
  for (const [name, value] of Object.entries(staticSecurityHeaders(mode))) response.headers.set(name, value);

  if (csrfToken) {
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      httpOnly: true,
      secure: mode.isProd,
      sameSite: "lax",
      path: "/"
    });
  }

  return response;
};

export const config = {
  matcher: [
    {
      // Everything except build assets, optimised images and the favicon file. Prefetches
      // are skipped as the Next.js CSP guide recommends: they render no document.
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" }
      ]
    }
  ]
};
