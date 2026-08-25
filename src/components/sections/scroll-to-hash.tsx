"use client";

import { useEffect } from "react";

/** Which row to flash on landing — set by the project row's own click handler. */
export const SCROLL_TARGET_STORAGE_KEY = "scrollToHash:target";
/** Where the page was scrolled to right before leaving for a case study. */
export const SCROLL_POSITION_STORAGE_KEY = "scrollToHash:y";
/**
 * Set by the case-study back link alongside the two above. Reveal and
 * AboutText each read this themselves (see skipEntranceAnimation below) so
 * their own entrance animations skip on this one landing — the page should
 * read as "you're back", not replay its first-visit intro. Cleared here,
 * deferred so every sibling effect gets a chance to read it first.
 */
export const SKIP_ENTRANCE_STORAGE_KEY = "scrollToHash:skipEntrance";

export const skipEntranceAnimation = (): boolean => sessionStorage.getItem(SKIP_ENTRANCE_STORAGE_KEY) === "1";

/**
 * The case-study "back" link routes here via sessionStorage instead of a URL
 * hash (see SiteHeader), so this is the only thing that ever moves the page:
 * it restores the exact scroll position you were at before opening the case
 * study — not a recentered view of the row — and briefly flashes that row so
 * it's clear where you ended up.
 */
export const ScrollToHash = (): null => {
  useEffect(() => {
    const cleanupTimeout = setTimeout(() => sessionStorage.removeItem(SKIP_ENTRANCE_STORAGE_KEY), 100);
    const storedTarget = sessionStorage.getItem(SCROLL_TARGET_STORAGE_KEY);
    const savedY = sessionStorage.getItem(SCROLL_POSITION_STORAGE_KEY);
    sessionStorage.removeItem(SCROLL_TARGET_STORAGE_KEY);
    sessionStorage.removeItem(SCROLL_POSITION_STORAGE_KEY);
    // Falls back to the URL hash for a deep link opened directly (no click,
    // so nothing was ever stashed in sessionStorage).
    const targetSelector = storedTarget ?? window.location.hash;
    if (!targetSelector) return;

    let target: HTMLElement | null = null;
    try {
      target = document.querySelector<HTMLElement>(targetSelector);
    } catch {
      return;
    }
    if (!target) return;

    // The html element's own scroll-behavior: smooth would animate either of
    // these jumps otherwise — off for just this one synchronous move.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    if (savedY !== null) {
      window.scrollTo(0, Number(savedY));
    } else {
      // No saved position (hard reload, direct link) — fall back to centering it.
      target.scrollIntoView({ block: "center" });
    }
    root.style.scrollBehavior = previous;

    if (document.activeElement === target) target.blur();

    // The page moved under a cursor that never did — browsers don't
    // re-evaluate :hover until the pointer actually moves, so whatever row
    // used to sit under it stays "hovered" after the jump. Dropping and
    // restoring pointer-events forces a fresh hover check on the next move.
    document.body.style.pointerEvents = "none";
    requestAnimationFrame(() => {
      document.body.style.pointerEvents = "";
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    target.classList.add("row-flash");
    const flashTimeout = setTimeout(() => target?.classList.remove("row-flash"), 4000);
    return () => clearTimeout(flashTimeout);
  }, []);

  return null;
};
