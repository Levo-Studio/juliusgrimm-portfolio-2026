import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/favicon/route";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

const html = (body: string): Response =>
  new Response(body, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });

const image = (): Response =>
  new Response(PNG, { status: 200, headers: { "content-type": "image/png" } });

const call = (u: string): Promise<Response> =>
  GET(new Request(`https://juliusgrimm.dev/api/favicon?u=${encodeURIComponent(u)}`));

afterEach(() => vi.unstubAllGlobals());

describe("favicon route", () => {
  it("serves the icon the page declares, not the conventional path", async () => {
    const seen: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      seen.push(url);
      if (url === "https://example.dev/") return html('<link rel="icon" sizes="192x192" href="/brand/icon.png">');
      return image();
    }));

    const response = await call("https://example.dev");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(seen).toContain("https://example.dev/brand/icon.png");
    expect(seen).not.toContain("https://example.dev/favicon.ico");
  });

  it("falls back to /favicon.ico when the page declares nothing", async () => {
    const seen: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      seen.push(url);
      if (url === "https://plain.dev/") return html("<title>no icon here</title>");
      return image();
    }));

    const response = await call("https://plain.dev");

    expect(response.status).toBe(200);
    expect(seen).toContain("https://plain.dev/favicon.ico");
  });

  it("still falls back when fetching the page throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "https://flaky.dev/") throw new Error("network");
      return image();
    }));

    expect((await call("https://flaky.dev")).status).toBe(200);
  });

  it("refuses an internal target without fetching anything", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect((await call("http://169.254.169.254/")).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("404s when the icon response is not an image", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) =>
      String(input) === "https://html.dev/"
        ? html("<title>x</title>")
        : new Response("<!doctype html>", { status: 200, headers: { "content-type": "text/html" } })
    ));

    expect((await call("https://html.dev")).status).toBe(404);
  });

  it("caches both hits and misses so repeat views cost nothing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 404 })));

    const response = await call("https://gone.dev");
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toContain("max-age=86400");
  });

  it("404s without a target", async () => {
    expect((await GET(new Request("https://juliusgrimm.dev/api/favicon"))).status).toBe(404);
  });
});
