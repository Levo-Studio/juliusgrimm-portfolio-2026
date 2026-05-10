"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const HomeAnimations = (): null => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true });
    const dFast = reduce ? 0.28 : 0.55;
    const dMain = reduce ? 0.42 : 0.8;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero-sub]", { opacity: 0, y: 20, duration: dFast })
        .from("[data-hero-title]", { opacity: 0, y: 30, duration: dMain }, "-=0.2")
        .from("[data-hero-cta]", { opacity: 0, y: 18, duration: reduce ? 0.34 : 0.6 }, "-=0.3");

      gsap.fromTo(
        "[data-hero-title]",
        { filter: "blur(10px)" },
        { filter: "blur(0px)", duration: reduce ? 0.45 : 0.9, ease: "power2.out" }
      );

      gsap.to("[data-hero-cta]", { boxShadow: "0 0 24px rgba(91,227,139,0.28)", repeat: -1, yoyo: true, duration: reduce ? 2.6 : 1.8, ease: "sine.inOut" });
      gsap.to("[data-hero-title]", { y: -5, duration: reduce ? 4.4 : 3.6, ease: "sine.inOut", repeat: -1, yoyo: true });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 26,
          immediateRender: false,
          duration: reduce ? 0.34 : 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true
          }
        });
      });

      gsap.to("[data-code-cloud]", {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom top",
          scrub: reduce ? 0.4 : 0.8
        }
      });

      gsap.to("[data-code-cloud-mobile]", {
        yPercent: -4,
        ease: "none",
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom top",
          scrub: reduce ? 0.45 : 0.9
        }
      });

      gsap.to("[data-code-cloud-mobile]", {
        opacity: 0.62,
        duration: reduce ? 3.3 : 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

      gsap.to("[data-code-cloud]", {
        opacity: 1,
        scrollTrigger: {
          trigger: "[data-hero-title]",
          start: "top 75%",
          end: "bottom top",
          scrub: reduce ? 0.35 : 0.6
        }
      });

      gsap.from("[data-tech-tag]", {
        opacity: 0,
        y: 14,
        stagger: 0.04,
        duration: reduce ? 0.26 : 0.45,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-tech-tag]",
          start: "top 90%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true
        }
      });

      gsap.from("[data-contact-card]", {
        opacity: 0,
        y: 18,
        stagger: 0.06,
        duration: reduce ? 0.3 : 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-contact-card]",
          start: "top 90%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true
        }
      });

      gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card, index) => {
        const thumb = card.querySelector<HTMLElement>("[data-card-thumb]");
        const title = card.querySelector<HTMLElement>("[data-card-title]");
        const subtitle = card.querySelector<HTMLElement>("[data-card-subtitle]");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true
          }
        });

        tl.from(card, { opacity: 0, y: 36, duration: reduce ? 0.28 : 0.46, ease: "power3.out", delay: index * 0.02 })
          .from(thumb, { opacity: 0, scale: 0.97, duration: reduce ? 0.25 : 0.42, ease: "power2.out" }, "-=0.34")
          .from(title, { opacity: 0, x: -14, duration: reduce ? 0.22 : 0.35, ease: "power2.out" }, "-=0.3")
          .from(subtitle, { opacity: 0, x: -10, duration: reduce ? 0.2 : 0.34, ease: "power2.out" }, "-=0.28");

        card.addEventListener("mouseenter", () => gsap.to(card, { y: -8, scale: 1.012, duration: 0.24, ease: "power2.out", overwrite: "auto" }));
        card.addEventListener("mouseleave", () => gsap.to(card, { y: 0, scale: 1, duration: 0.24, ease: "power2.out", overwrite: "auto" }));
      });

      gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
        gsap.to(card, {
          y: -3,
          duration: reduce ? 2.8 : 2.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
};
