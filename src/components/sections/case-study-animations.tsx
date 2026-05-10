"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const CaseStudyAnimations = (): null => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-case-heading], [data-case-body], [data-case-back]").forEach((element, index) => {
        gsap.from(element, {
          opacity: 0,
          y: 18,
          immediateRender: false,
          duration: 0.65,
          delay: index * 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            toggleActions: "play none none reverse"
          }
        });
      });

      gsap.from("[data-tech-tag]", {
        opacity: 0,
        y: 12,
        scale: 0.98,
        stagger: 0.04,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-tech-tag]",
          start: "top 92%",
          toggleActions: "play none none reverse"
        }
      });

      gsap.to("[data-case-back]", {
        x: 4,
        duration: 0.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
};
