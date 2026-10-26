export type RateLimiter = {
  /** Counts one attempt for `key`; false once `max` attempts were made in the current window. */
  hit: (key: string, max: number) => boolean;
  /** Number of tracked keys, for tests and diagnostics. */
  size: () => number;
};

/**
 * Fixed-window, in-memory attempt counter. Every key's window starts with its first attempt.
 * Expired keys are swept at most once per `sweepEveryMs`, so a caller spraying fresh keys
 * cannot grow the map beyond what one window's worth of traffic holds.
 */
export const createRateLimiter = (windowMs: number, sweepEveryMs = 60_000): RateLimiter => {
  const attempts = new Map<string, { count: number; until: number }>();
  let nextSweepAt = 0;

  const sweep = (now: number): void => {
    if (now < nextSweepAt) return;
    nextSweepAt = now + sweepEveryMs;
    for (const [key, state] of attempts) {
      if (state.until <= now) attempts.delete(key);
    }
  };

  return {
    hit: (key, max) => {
      const now = Date.now();
      sweep(now);
      const state = attempts.get(key);
      if (!state || state.until <= now) {
        attempts.set(key, { count: 1, until: now + windowMs });
        return true;
      }
      if (state.count >= max) return false;
      state.count += 1;
      return true;
    },
    size: () => attempts.size
  };
};
