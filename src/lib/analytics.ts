/**
 * The analytics script the root layout loads. The Content Security Policy derives the
 * analytics origin from this URL, so the two cannot drift apart: the script sends its
 * page views back to the host it was loaded from.
 */
export const ANALYTICS_SCRIPT_SRC = "https://analytics.levo-studio.com/script.js";
export const ANALYTICS_WEBSITE_ID = "8b3afaca-7d36-46a4-bc69-989ff1e1638f";
export const ANALYTICS_ORIGIN = new URL(ANALYTICS_SCRIPT_SRC).origin;
