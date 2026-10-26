import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "@/server/rate-limit";

const WINDOW = 10 * 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-26T12:00:00.000Z"));
});
afterEach(() => vi.useRealTimers());

describe("createRateLimiter", () => {
  it("allows max attempts per key and window, then blocks until the window ends", () => {
    const limiter = createRateLimiter(WINDOW);
    for (let i = 0; i < 5; i += 1) expect(limiter.hit("a", 5)).toBe(true);
    expect(limiter.hit("a", 5)).toBe(false);
    expect(limiter.hit("b", 5)).toBe(true);

    vi.advanceTimersByTime(WINDOW);
    expect(limiter.hit("a", 5)).toBe(true);
  });

  it("prunes expired keys so sprayed keys do not accumulate", () => {
    const limiter = createRateLimiter(WINDOW);
    for (let i = 0; i < 1000; i += 1) limiter.hit(`spray-${i}`, 10);
    expect(limiter.size()).toBe(1000);

    vi.advanceTimersByTime(WINDOW + 1);
    limiter.hit("fresh", 10);
    expect(limiter.size()).toBe(1);
  });

  it("keeps keys whose window is still open when it prunes", () => {
    const limiter = createRateLimiter(WINDOW);
    limiter.hit("old", 10);
    vi.advanceTimersByTime(WINDOW / 2);
    limiter.hit("recent", 10);
    vi.advanceTimersByTime(WINDOW / 2 + 1);
    limiter.hit("now", 10);
    expect(limiter.size()).toBe(2);
  });
});
