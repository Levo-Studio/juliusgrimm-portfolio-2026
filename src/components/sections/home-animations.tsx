"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const HomeAnimations = (): null => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.defaults({ fastScrollEnd: true });
    const dFast = reduce ? 0.28 : 0.55;
    const dMain = reduce ? 0.42 : 0.8;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo("[data-hero-sub]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: dFast, clearProps: "opacity,visibility,transform" })
        .fromTo("[data-hero-title]", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: dMain, clearProps: "opacity,visibility,transform" }, "-=0.2")
        .fromTo("[data-hero-cta]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: reduce ? 0.34 : 0.6, clearProps: "opacity,visibility,transform" }, "-=0.3");

      gsap.fromTo(
        "[data-hero-title]",
        { filter: "blur(10px)" },
        { filter: "blur(0px)", duration: reduce ? 0.45 : 0.9, ease: "power2.out" }
      );

      gsap.utils.toArray<HTMLElement>("[data-reveal], [data-card]").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0.34 },
          {
            opacity: 1,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: element,
              start: "top 95%",
              end: "top 68%",
              scrub: reduce ? 0.55 : 1.15,
              invalidateOnRefresh: true,
              fastScrollEnd: true
            }
          }
        );
      });

      gsap.fromTo(
        "[data-tech-tag]",
        { opacity: 0.4, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: reduce ? 0.03 : 0.045,
          duration: reduce ? 0.3 : 0.42,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-tech-wrap]",
            start: "top 90%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
            fastScrollEnd: true
          },
          clearProps: "opacity,transform"
        }
      );

      gsap.fromTo(
        "[data-contact-card]",
        { opacity: 0.42, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: reduce ? 0.035 : 0.05,
          duration: reduce ? 0.3 : 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-contact-wrap]",
            start: "top 90%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
            fastScrollEnd: true
          },
          clearProps: "opacity,transform"
        }
      );

      gsap.fromTo(
        "[data-footer-wrap]",
        { opacity: 0.36, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: reduce ? 0.34 : 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-footer-wrap]",
            start: "top 92%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
            fastScrollEnd: true
          },
          clearProps: "opacity,transform"
        }
      );

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

      ScrollTrigger.normalizeScroll(true);
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
};
