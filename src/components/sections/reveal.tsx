"use client";

import { useEffect } from "react";

/**
 * Fades sections up as they scroll in, staggering any [data-row] children.
 *
 * Observe-first with an unconditional release: a section is only hidden once the
 * observer has actually reported it off-screen, and after 1.2s everything is shown
 * regardless. Both guards exist because the earlier version could leave content
 * permanently invisible when the observer never fired — inside a scroll container
 * that isn't the window, for instance.
 */
export const Reveal = (): null => {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (nodes.length === 0) return;

    const show = (el: HTMLElement, stagger: boolean): void => {
      el.setAttribute("data-shown", "");
      el.querySelectorAll<HTMLElement>("[data-row]").forEach((row, index) => {
        const delay = stagger ? index * 45 + 120 : 0;
        row.style.transitionDelay = `${delay}ms`;
        // Hand `transition` back to the hover rule once the row has landed, so the
        // hover shift is never competing with the reveal's timing function.
        window.setTimeout(() => {
          row.style.transitionDelay = "";
        }, delay + 500);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          show(el, el.hasAttribute("data-offscreen"));
          observer.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((node) => {
      // Anything already in view on load is shown immediately and un-staggered.
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) show(node, false);
      else {
        node.setAttribute("data-offscreen", "");
        observer.observe(node);
      }
    });

    const failsafe = window.setTimeout(() => {
      observer.disconnect();
      nodes.forEach((node) => show(node, false));
    }, 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return null;
};
