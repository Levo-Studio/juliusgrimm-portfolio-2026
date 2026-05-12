import { describe, expect, it } from "vitest";

import { getProjectMonthLabel, parseProjectMonthInput } from "@/lib/project-meta";

describe("getProjectMonthLabel", () => {
  it("formats a Date into month and year", () => {
    expect(getProjectMonthLabel(new Date("2026-04-01T00:00:00.000Z"))).toBe("April 2026");
  });

  it("falls back when the value is missing or invalid", () => {
    expect(getProjectMonthLabel(undefined)).toBe("April 2026");
    expect(getProjectMonthLabel("not-a-date")).toBe("April 2026");
  });
});

describe("parseProjectMonthInput", () => {
  it("parses month-year input into the first day of that month in UTC", () => {
    expect(parseProjectMonthInput("May 2026")?.toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("rejects invalid month-year values", () => {
    expect(parseProjectMonthInput("Foo 2026")).toBeNull();
    expect(parseProjectMonthInput("2026 May")).toBeNull();
  });
});
