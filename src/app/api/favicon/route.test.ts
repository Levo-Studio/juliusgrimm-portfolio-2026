import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Project link hosts the resolver may serve, and what each name resolves to. Names missing
// from DNS fail to resolve, like NXDOMAIN.
const ALLOWED_HOSTS = ["example.dev", "plain.dev", "flaky.dev", "html.dev", "gone.dev", "internal.dev", "mixed.dev", "redirects.dev", "sneaky.dev"];
const DNS: Record<string, string[]> = {
  "example.dev": ["93.184.215.14"],
  "plain.dev": ["93.184.215.15", "2606:4700::6810:84e5"],
  "flaky.dev": ["93.184.215.16"],
  "html.dev": ["93.184.215.17"],
  "gone.dev": ["93.184.215.18"],
  "redirects.dev": ["93.184.215.19"],
  "sneaky.dev": ["93.184.215.20"],
  "cdn.example.net": ["151.101.1.1"],
  "internal.dev": ["10.0.0.5"],
  "mixed.dev": ["93.184.215.21", "127.0.0.1"],
  "metadata.attacker.dev": ["169.254.169.254"],
  "mapped.attacker.dev": ["::ffff:127.0.0.1"],
  "not-allowed.dev": ["93.184.215.22"]
};

const lookup = vi.hoisted(() => vi.fn());
vi.mock("dns/promises", () => ({ lookup }));
vi.mock("@/server/projects", () => ({ getFaviconHosts: async () => new Set(ALLOWED_HOSTS) }));

const { GET } = await import("@/app/api/favicon/route");

beforeEach(() => {
  lookup.mockImplementation(async (hostname: string, options: { all?: boolean }) => {
    expect(options).toMatchObject({ all: true });
    const addresses = DNS[hostname];
    if (!addresses) throw Object.assign(new Error(`getaddrinfo ENOTFOUND ${hostname}`), { code: "ENOTFOUND" });
    return addresses.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
  });
});

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

const html = (body: string): Response =>
  new Response(body, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });

const image = (): Response =>
  new Response(PNG, { status: 200, headers: { "content-type": "image/png" } });

const call = (u: string): Promise<Response> =>
  GET(new Request(`https://juliusgrimm.dev/api/favicon?u=${encodeURIComponent(u)}`));

afterEach(() => {
  vi.unstubAllGlobals();
  lookup.mockReset();
});

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
  it("serves only hosts that appear in project links", async () => {
    const fetchMock = vi.fn(async () => image());
    vi.stubGlobal("fetch", fetchMock);

    const response = await call("https://not-allowed.dev");
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toContain("max-age=86400");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(lookup).not.toHaveBeenCalled();
  });

  it("matches allowed hosts case- and trailing-dot-insensitively", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) =>
      String(input) === "https://example.dev/" ? html("<title>x</title>") : image()
    ));
    expect((await call("https://EXAMPLE.dev.")).status).toBe(200);
  });

  it("refuses an allowed name that resolves to a private address", async () => {
    const fetchMock = vi.fn(async () => image());
    vi.stubGlobal("fetch", fetchMock);

    expect((await call("https://internal.dev")).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a name when any one of its addresses is internal", async () => {
    const fetchMock = vi.fn(async () => image());
    vi.stubGlobal("fetch", fetchMock);

    expect((await call("https://mixed.dev")).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not follow a redirect to a name that resolves internally", async () => {
    const seen: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      seen.push(url);
      if (url === "https://redirects.dev/") return new Response(null, { status: 302, headers: { location: "http://metadata.attacker.dev/latest/" } });
      if (url === "https://redirects.dev/favicon.ico") return new Response(null, { status: 301, headers: { location: "http://mapped.attacker.dev/icon.png" } });
      return image();
    }));

    expect((await call("https://redirects.dev")).status).toBe(404);
    expect(seen).toEqual(["https://redirects.dev/", "https://redirects.dev/favicon.ico"]);
  });

  it("does not fetch a declared icon on a name that resolves internally", async () => {
    const seen: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      seen.push(url);
      if (url === "https://sneaky.dev/") return html('<link rel="icon" href="http://metadata.attacker.dev/icon.png">');
      return image();
    }));

    expect((await call("https://sneaky.dev")).status).toBe(404);
    expect(seen).toEqual(["https://sneaky.dev/"]);
  });

  it("follows redirects and declared icons to other public hosts", async () => {
    const seen: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      seen.push(url);
      if (url === "https://example.dev/") return html('<link rel="icon" href="https://cdn.example.net/icon.png">');
      return image();
    }));

    expect((await call("https://example.dev")).status).toBe(200);
    expect(seen).toContain("https://cdn.example.net/icon.png");
    expect(lookup).toHaveBeenCalledWith("cdn.example.net", expect.anything());
  });

  it("404s when the name does not resolve", async () => {
    const fetchMock = vi.fn(async () => image());
    vi.stubGlobal("fetch", fetchMock);
    ALLOWED_HOSTS.push("nxdomain.dev");
    try {
      expect((await call("https://nxdomain.dev")).status).toBe(404);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      ALLOWED_HOSTS.pop();
    }
  });
});
