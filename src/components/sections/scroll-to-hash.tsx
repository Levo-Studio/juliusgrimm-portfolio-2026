"use client";

import { useEffect } from "react";

/**
 * The case-study "back" link points at the specific project row instead of
 * just #projects, so returning lands you back where you left off. The site's
 * global smooth scroll-behavior would animate that landing scroll on load,
 * which reads as sluggish for a "you're back" navigation — so the initial
 * jump is instant, and the row gets a brief flash instead to mark where you
 * are, using the same tint the row hover already uses.
 */
export const ScrollToHash = (): null => {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    let target: HTMLElement | null = null;
    try {
      target = document.querySelector<HTMLElement>(hash);
    } catch {
      return;
    }
    if (!target) return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "center" });
    root.style.scrollBehavior = previousBehavior;

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
    const timeout = setTimeout(() => target?.classList.remove("row-flash"), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return null;
};
