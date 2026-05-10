"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const ImpressumAnimations = (): null => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dMain = reduce ? 0.36 : 0.65;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-imp-title]", { opacity: 0, y: 20, duration: dMain })
        .from("[data-imp-subtitle]", { opacity: 0, y: 18, duration: reduce ? 0.3 : 0.55 }, "-=0.28")
        .from("[data-imp-back]", { opacity: 0, x: -14, duration: reduce ? 0.25 : 0.45 }, "-=0.25");

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 20,
          duration: reduce ? 0.3 : 0.52,
          immediateRender: false,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true
          }
        });
      });

      gsap.to("[data-imp-back]", {
        x: 5,
        duration: reduce ? 1.2 : 0.85,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
};
