"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Sections fade up as they scroll in and fade back down when you scroll past them
 * upwards, so the page reads the same in both directions.
 *
 * The hidden starting state lives in CSS behind `.reveal-ready`, which the pre-paint
 * script sets — with JS disabled nothing is ever hidden. If ScrollTrigger fails to
 * set up for any reason, the catch below reveals everything rather than leaving the
 * page blank.
 */
export const Reveal = (): null => {
  useEffect(() => {
    const nodes = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (nodes.length === 0) return;

    const revealAll = (): void => {
      nodes.forEach((node) => node.setAttribute("data-shown", ""));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAll();
      return;
    }

    let ctx: gsap.Context | undefined;
    try {
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        nodes.forEach((node) => {
          // Marks the section shown so the CSS hidden state stops applying; GSAP owns
          // the values from here.
          node.setAttribute("data-shown", "");
          const rows = gsap.utils.toArray<HTMLElement>(node.querySelectorAll("[data-row]"));

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: node,
              start: "top 88%",
              // play on the way down, reverse on the way back up
              toggleActions: "play none none reverse"
            }
          });

          timeline.fromTo(
            node,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
          );

          if (rows.length > 0) {
            timeline.fromTo(
              rows,
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.4, stagger: 0.045, ease: "power2.out" },
              "-=0.3"
            );
          }
        });
      });
    } catch {
      revealAll();
      return;
    }

    return () => ctx?.revert();
  }, []);

  return null;
};
