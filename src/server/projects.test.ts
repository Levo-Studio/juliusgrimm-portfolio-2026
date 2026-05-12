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
