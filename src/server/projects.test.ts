import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn(() => {
  throw new Error("db unavailable");
});

vi.mock("@/server/db/client", () => ({
  db: {
    select: vi.fn(() => ({
      from: fromMock
    }))
  }
}));

describe("getVisibleProjects", () => {
  beforeEach(() => {
    fromMock.mockClear();
  });

  it("sorts fallback projects by createdAt ascending and title within the same month", async () => {
    const { getVisibleProjects } = await import("@/server/projects");

    const projects = await getVisibleProjects();

    expect(projects.map((project) => project.slug)).toEqual([
      "juliusgrimm-portfolio-2025",
      "levo-studio-tickets",
      "levo-studio-db-controller",
      "levo-studio-finance",
      "orbitaly",
      "vibevote"
    ]);
  });
});

describe("getFaviconHosts", () => {
  const fallbackHosts = ["2025.juliusgrimm.dev", "github.com", "vibevote.de", "orbitaly.de"];

  it("allows the fallback projects' hosts while the database is unavailable", async () => {
    const { getFaviconHosts } = await import("@/server/projects");
    expect([...(await getFaviconHosts())].sort()).toEqual([...fallbackHosts].sort());
  });

  it("adds the normalised host of every project link in the database", async () => {
    fromMock.mockImplementationOnce((() => [
      { url: "https://Example.DEV/path?q=1" },
      { url: "https://hidden-project.dev." },
      { url: "http://xn--bcher-kva.example/" },
      { url: "not a url" }
    ]) as never);
    const { getFaviconHosts } = await import("@/server/projects");

    const hosts = await getFaviconHosts();
    expect(hosts.has("example.dev")).toBe(true);
    expect(hosts.has("hidden-project.dev")).toBe(true);
    expect(hosts.has("xn--bcher-kva.example")).toBe(true);
    for (const host of fallbackHosts) expect(hosts.has(host)).toBe(true);
    expect(hosts.size).toBe(fallbackHosts.length + 3);
  });
});
