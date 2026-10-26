import { ANALYTICS_ORIGIN } from "@/lib/analytics";

export type SecurityMode = { isDev: boolean; isProd: boolean };

/** Origins the browser really connects to from our pages, besides our own. */
const CONNECT_ORIGINS = ["https://api.github.com", ANALYTICS_ORIGIN];

/** A fresh, unguessable nonce for one response (128 bits, base64). */
export const createNonce = (): string => Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");

/**
 * Nonce-based strict CSP. 'strict-dynamic' lets the nonced Next.js runtime load its own
 * chunks and the analytics script without listing hosts in script-src. React needs
 * 'unsafe-eval' in development only, to rebuild server error stacks in the browser.
 */
export const buildContentSecurityPolicy = (nonce: string, { isDev, isProd }: SecurityMode): string =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "font-src 'self'",
    `connect-src 'self' ${CONNECT_ORIGINS.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    ...(isProd ? ["upgrade-insecure-requests"] : [])
  ].join("; ");

/** Response headers every matched response carries, apart from the CSP. */
export const staticSecurityHeaders = ({ isProd }: SecurityMode): Record<string, string> => ({
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // publickey-credentials-* stay at their defaults: passkey sign-in must keep working.
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  ...(isProd ? { "Strict-Transport-Security": "max-age=63072000" } : {})
});
