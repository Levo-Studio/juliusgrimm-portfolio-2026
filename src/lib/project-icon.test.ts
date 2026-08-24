import { describe, expect, it } from "vitest";
import { getFaviconUrl, getProjectSiteUrl } from "@/lib/project-icon";

const link = (over: Partial<{ id: string; label: string; url: string; visible: boolean; sortOrder: number }> = {}) => ({
  id: "l", label: "x", url: "https://example.com", visible: true, sortOrder: 1, ...over
});

describe("getProjectSiteUrl", () => {
  it("takes the first visible non-repository link in sort order", () => {
    expect(getProjectSiteUrl([
      link({ id: "b", url: "https://github.com/a/b", sortOrder: 2 }),
      link({ id: "a", url: "https://vibevote.de", sortOrder: 1 })
    ])).toBe("https://vibevote.de");
  });

  it("skips repository hosts even when they come first", () => {
    expect(getProjectSiteUrl([link({ url: "https://github.com/a/b" })])).toBeNull();
  });

  it("ignores hidden links", () => {
    expect(getProjectSiteUrl([link({ visible: false })])).toBeNull();
  });
});

describe("getFaviconUrl", () => {
  it("routes through the resolver using the origin only", () => {
    expect(getFaviconUrl("https://orbitaly.de/some/page"))
      .toBe("/api/favicon?u=https%3A%2F%2Forbitaly.de");
  });

  it("returns null when there is no site", () => {
    expect(getFaviconUrl(null)).toBeNull();
  });
});
