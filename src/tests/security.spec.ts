import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
import { createGuardrails, generateSync } from "otplib";
import { ANALYTICS_ORIGIN } from "../lib/analytics";

// Runs every page under the real Content-Security-Policy from src/proxy.ts and fails on
// anything the browser blocks. The analytics host is answered by a local stub that also
// calls back to its origin, so the CSP's script and connect rules for it are exercised
// without leaving the machine.
//
// The admin flow at the bottom needs an empty admin_users table: the first password sign-in
// creates the admin. When an admin already exists it is skipped, not failed.

// Admin TOTP secrets are 10 bytes (see src/server/totp.ts), below otplib's default minimum.
const totp = (secret: string): string => generateSync({ secret, guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }) });

type Violation = { directive: string; blocked: string; sample: string };

declare global {
  interface Window {
    __cspViolations: Violation[];
    __analyticsStubLoaded?: boolean;
    __analyticsStubSent?: boolean;
  }
}

const ANALYTICS_STUB = `window.__analyticsStubLoaded = true;
fetch(new URL("/api/send", document.currentScript.src), { method: "POST", body: "{}" })
  .then(function () { window.__analyticsStubSent = true; });`;

type Watch = { consoleErrors: string[]; pageErrors: string[] };

const watch = async (page: Page): Promise<Watch> => {
  const result: Watch = { consoleErrors: [], pageErrors: [] };
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__cspViolations.push({ directive: event.violatedDirective, blocked: event.blockedURI, sample: event.sample });
    });
  });
  await page.route(`${ANALYTICS_ORIGIN}/**`, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ status: 200, contentType: "text/javascript", body: ANALYTICS_STUB })
      : route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  );
  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error") return;
    const source = message.location().url;
    // The favicon resolver answers 404 when a project's site cannot be reached (no network
    // here), and the deliberate 404 page logs its own status.
    const expected404 = /status of 404/.test(message.text()) && (/\/api\/favicon\?/.test(source) || /\/this-page-does-not-exist/.test(source));
    if (!expected404) result.consoleErrors.push(`${message.text()} @ ${source}`);
  });
  page.on("pageerror", (error) => result.pageErrors.push(error.message));
  return result;
};

const hydrated = (page: Page): Promise<boolean> =>
  page.evaluate(() => Object.keys(document.body).some((key) => key.startsWith("__reactFiber$")));

const expectCleanPage = async (page: Page, seen: Watch): Promise<void> => {
  await expect.poll(() => hydrated(page), { message: "React hydrated the page" }).toBe(true);
  await expect(page.locator("html")).toHaveClass(/\breveal-ready\b/);
  await expect.poll(() => page.evaluate(() => window.__analyticsStubLoaded === true), { message: "analytics script ran" }).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__analyticsStubSent === true), { message: "analytics beacon was allowed" }).toBe(true);
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  expect(seen.consoleErrors).toEqual([]);
  expect(seen.pageErrors).toEqual([]);
};

const expectNonceCsp = (csp: string | undefined): string => {
  expect(csp).toBeTruthy();
  const nonce = /'nonce-([A-Za-z0-9+/=]+)'/.exec(csp ?? "")?.[1];
  expect(nonce, "CSP carries a nonce").toBeTruthy();
  expect(csp).toContain("'strict-dynamic'");
  return nonce as string;
};

test.describe("public pages under the CSP", () => {
  const projectSlugs = async (page: Page): Promise<string[]> => {
    const sitemap = await (await page.request.get("/sitemap.xml")).text();
    return [...sitemap.matchAll(/\/projects\/([^<]+)<\/loc>/g)].map((match) => match[1]);
  };

  test("project pages exist to check", async ({ page }) => {
    expect((await projectSlugs(page)).length).toBeGreaterThan(0);
  });

  for (const path of ["/", "/impressum", "/this-page-does-not-exist", "/admin"]) {
    test(`${path} renders with no CSP violation`, async ({ page }) => {
      const seen = await watch(page);
      const response = await page.goto(path);
      expect(response?.status()).toBe(path === "/this-page-does-not-exist" ? 404 : 200);

      const headers = response?.headers() ?? {};
      const nonce = expectNonceCsp(headers["content-security-policy"]);
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      // The theme script is the one inline script we write ourselves.
      expect(await page.locator("head script:not([src]):not([type])").first().evaluate((el) => (el as HTMLScriptElement).nonce)).toBe(nonce);

      await expectCleanPage(page, seen);
    });
  }

  test("every project page renders with no CSP violation", async ({ page }) => {
    test.setTimeout(120_000);
    const seen = await watch(page);
    for (const slug of await projectSlugs(page)) {
      const response = await page.goto(`/projects/${slug}`);
      expect(response?.status(), slug).toBe(200);
      expectNonceCsp(response?.headers()["content-security-policy"]);
      // JSON-LD is data, not script: it must be present and not reported.
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
      await expectCleanPage(page, seen);
    }
  });

  test("the theme toggle works after hydration", async ({ page }) => {
    const seen = await watch(page);
    await page.goto("/");
    await expect.poll(() => hydrated(page)).toBe(true);
    await page.getByRole("button", { name: "Dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    // Applied by the nonced inline theme script before React runs.
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Match system theme" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
    await expectCleanPage(page, seen);
  });

  test("the favicon resolver keeps its own sandbox CSP", async ({ request }) => {
    const response = await request.get("/api/favicon?u=https%3A%2F%2Fexample.invalid");
    expect(response.headers()["content-security-policy"]).toBeUndefined();
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });
});

test.describe("admin under the CSP", () => {
  test.describe.configure({ mode: "serial" });

  const EMAIL = "e2e-admin@example.com";
  const PASSWORD = "e2e-correct-horse-battery";
  let totpSecret = "";

  const signInWithPassword = async (page: Page): Promise<void> => {
    await page.goto("/admin");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
  };

  const logOut = async (page: Page): Promise<void> => {
    await page.getByRole("button", { name: "Log out", exact: true }).click();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  };

  test("first admin, server actions, passkey and 2FA work", async ({ page, context }) => {
    test.setTimeout(120_000);
    const seen = await watch(page);

    // 1. The first password sign-in on an empty database creates the admin.
    await signInWithPassword(page);
    const outcome = await Promise.race([
      page.getByText("Admin / Case studies").waitFor().then(() => "dashboard" as const),
      page.getByText("Invalid credentials.").waitFor().then(() => "exists" as const)
    ]);
    test.skip(outcome === "exists", "an admin already exists in this database; the flow needs an empty admin_users table");
    await expectCleanPage(page, seen);

    // 2. First visit without a CSRF cookie: the proxy mints it and the same render's forms
    //    must already work. Unpublish and publish a project through the server action.
    await context.clearCookies({ name: "admin_csrf" });
    const first = await page.goto("/admin");
    expect((await first?.allHeaders())?.["set-cookie"]).toMatch(/admin_csrf=[0-9a-f]{32}/);
    const row = page.locator(".row-link").filter({ hasText: "Orbitaly" });
    await row.getByRole("button", { name: "Unpublish" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Unpublish" }).click();
    await expect(row.getByText("◌ DRAFT")).toBeVisible();
    await row.getByRole("button", { name: "Publish" }).click();
    await expect(row.getByText("● PUBLISHED")).toBeVisible();

    // 3. Register a passkey with a virtual authenticator, then sign in with it.
    const cdp = await context.newCDPSession(page);
    await cdp.send("WebAuthn.enable");
    await cdp.send("WebAuthn.addVirtualAuthenticator", {
      options: { protocol: "ctap2", transport: "internal", hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true }
    });
    await page.getByRole("button", { name: "Settings" }).first().click();
    const reloaded = page.waitForEvent("load");
    await page.getByRole("button", { name: "Register passkey" }).click();
    await reloaded;
    await page.goto("/admin?tab=settings");
    await expect(page.getByText(/^Last used: /)).toBeVisible();

    const options = await page.evaluate(async () => {
      const response = await fetch("/api/admin/passkeys/login/options", { method: "POST" });
      return { status: response.status, body: (await response.json()) as { challenge?: string } };
    });
    expect(options.status).toBe(200);
    expect(options.body.challenge).toBeTruthy();

    await logOut(page);
    await page.getByRole("button", { name: "Sign in with passkey" }).click();
    await expect(page.getByText("Admin / Case studies")).toBeVisible();

    // 4. Enable 2FA (QR code is a data: image), then sign in with password + code.
    await page.getByRole("button", { name: "Settings" }).first().click();
    await page.getByRole("button", { name: "Setup 2FA" }).click();
    await expect(page.getByAltText("2FA QR Code")).toBeVisible();
    totpSecret = ((await page.getByText(/^Secret: /).textContent()) ?? "").replace("Secret: ", "").trim();
    expect(totpSecret).toMatch(/^[A-Z2-7]+$/);
    await page.getByPlaceholder("123456").fill(totp(totpSecret));
    await page.getByRole("button", { name: "Enable 2FA" }).click();
    await expect(page.getByText("2FA enabled successfully.")).toBeVisible();

    await logOut(page);
    await signInWithPassword(page);
    await expect(page).toHaveURL(/\/admin\/2fa$/);
    await expectCleanPage(page, seen);
    await page.getByLabel("Six-digit authentication code").fill(totp(totpSecret));
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await expect(page.getByText("Admin / Case studies")).toBeVisible();

    await expectCleanPage(page, seen);
  });
});
