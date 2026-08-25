"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skipEntranceAnimation } from "@/components/sections/scroll-to-hash";

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

    // Landing back on the page: only what's already on screen skips its
    // animation — anything further down still plays normally once scrolled
    // into view, instead of the whole page being marked shown up front.
    const skipInView = skipEntranceAnimation();

    let ctx: gsap.Context | undefined;
    try {
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        nodes.forEach((node) => {
          const alreadyInView = skipInView && node.getBoundingClientRect().top < window.innerHeight * 0.88;

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
            { opacity: 1, y: 0, duration: alreadyInView ? 0 : 0.5, ease: "power2.out" }
          );

          if (rows.length > 0) {
            timeline.fromTo(
              rows,
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: alreadyInView ? 0 : 0.4, stagger: alreadyInView ? 0 : 0.045, ease: "power2.out" },
              alreadyInView ? "<" : "-=0.3"
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
