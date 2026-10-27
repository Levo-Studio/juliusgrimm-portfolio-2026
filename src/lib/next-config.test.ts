import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config images", () => {
  it("does not let the image optimizer fetch from remote hosts", () => {
    expect(nextConfig.images?.remotePatterns ?? []).toEqual([]);
    expect(nextConfig.images?.domains ?? []).toEqual([]);
  });
});
