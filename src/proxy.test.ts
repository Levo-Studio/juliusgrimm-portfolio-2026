// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";
import { ANALYTICS_ORIGIN, ANALYTICS_SCRIPT_SRC } from "@/lib/analytics";

const request = (path: string, headers: Record<string, string> = {}): NextRequest =>
  new NextRequest(`http://localhost:3000${path}`, { headers });

const nonceOf = (csp: string | null): string | undefined => /'nonce-([^']+)'/.exec(csp ?? "")?.[1];

/** Request headers the proxy forwards to the render, as Next encodes them on the response. */
const forwarded = (response: Response, name: string): string | null => response.headers.get(`x-middleware-request-${name}`);

afterEach(() => vi.unstubAllEnvs());

describe("proxy security headers", () => {
  it("sets the hardening headers on every matched response", () => {
    const response = proxy(request("/"));
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
  });

  it("never restricts passkeys through Permissions-Policy", () => {
    expect(proxy(request("/admin")).headers.get("Permissions-Policy")).not.toMatch(/publickey-credentials/);
  });

  it("sends a strict nonce-based CSP and forwards the same nonce to the render", () => {
    const response = proxy(request("/"));
    const csp = response.headers.get("Content-Security-Policy");
    const nonce = nonceOf(csp);

    expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' https: data:");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
    // Next reads the nonce from the request's CSP header; the layout reads x-nonce.
    expect(forwarded(response, "content-security-policy")).toBe(csp);
    expect(forwarded(response, "x-nonce")).toBe(nonce);
  });

  it("allows connections to GitHub and to the analytics host the layout loads", () => {
    expect(ANALYTICS_ORIGIN).toBe(new URL(ANALYTICS_SCRIPT_SRC).origin);
    const csp = proxy(request("/")).headers.get("Content-Security-Policy");
    expect(csp).toContain(`connect-src 'self' https://api.github.com ${ANALYTICS_ORIGIN};`);
  });

  it("uses a different nonce for every request", () => {
    const nonces = new Set(Array.from({ length: 50 }, () => nonceOf(proxy(request("/")).headers.get("Content-Security-Policy"))));
    expect(nonces.size).toBe(50);
  });

  it("adds unsafe-eval only in development and HSTS / upgrade-insecure-requests only in production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const dev = proxy(request("/"));
    expect(dev.headers.get("Content-Security-Policy")).toContain("'strict-dynamic' 'unsafe-eval'");
    expect(dev.headers.get("Content-Security-Policy")).not.toContain("upgrade-insecure-requests");
    expect(dev.headers.get("Strict-Transport-Security")).toBeNull();

    vi.stubEnv("NODE_ENV", "production");
    const prod = proxy(request("/"));
    expect(prod.headers.get("Content-Security-Policy")).not.toContain("unsafe-eval");
    expect(prod.headers.get("Content-Security-Policy")).toMatch(/; upgrade-insecure-requests$/);
    expect(prod.headers.get("Strict-Transport-Security")).toBe("max-age=63072000");
  });

  it("leaves the favicon resolver's own sandbox CSP in place", () => {
    const response = proxy(request("/api/favicon?u=https%3A%2F%2Fexample.dev"));
    expect(response.headers.get("Content-Security-Policy")).toBeNull();
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});

describe("proxy admin CSRF cookie", () => {
  it("mints the cookie on the first admin visit and hands it to the same render", () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = proxy(request("/admin", { cookie: "admin_session=abc" }));
    const cookie = response.cookies.get("admin_csrf");

    expect(cookie?.value).toMatch(/^[0-9a-f]{32}$/);
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(forwarded(response, "cookie")).toBe(`admin_session=abc; admin_csrf=${cookie?.value}`);
  });

  it("keeps an existing cookie and other request cookies untouched", () => {
    const response = proxy(request("/admin/projects/new", { cookie: "admin_csrf=existing; admin_session=abc" }));
    expect(response.cookies.get("admin_csrf")).toBeUndefined();
    expect(forwarded(response, "cookie")).toBe("admin_csrf=existing; admin_session=abc");
  });

  it("does not set the cookie outside the admin", () => {
    expect(proxy(request("/")).cookies.get("admin_csrf")).toBeUndefined();
    expect(proxy(request("/projects/orbitaly")).cookies.get("admin_csrf")).toBeUndefined();
  });
});

describe("proxy matcher", () => {
  const matches = (url: string, headers?: Record<string, string>): boolean =>
    unstable_doesMiddlewareMatch({ config, url, headers });

  it("runs on pages, the admin, server actions and API routes", () => {
    expect(matches("/")).toBe(true);
    expect(matches("/impressum")).toBe(true);
    expect(matches("/projects/orbitaly")).toBe(true);
    expect(matches("/admin")).toBe(true);
    expect(matches("/admin/2fa")).toBe(true);
    expect(matches("/api/favicon?u=x")).toBe(true);
    expect(matches("/does-not-exist")).toBe(true);
  });

  it("skips build assets, optimised images, the favicon file and router prefetches", () => {
    expect(matches("/_next/static/chunks/main.js")).toBe(false);
    expect(matches("/_next/image?url=%2Fjg_logo.png&w=32&q=75")).toBe(false);
    expect(matches("/favicon.ico")).toBe(false);
    expect(matches("/projects/orbitaly", { "next-router-prefetch": "1" })).toBe(false);
    expect(matches("/projects/orbitaly", { purpose: "prefetch" })).toBe(false);
  });
});
