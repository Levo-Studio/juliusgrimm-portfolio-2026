"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const HomeAnimations = (): null => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const touchMode = reduce || coarse;
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.defaults({ fastScrollEnd: true });
    const dFast = touchMode ? 0.28 : 0.55;
    const dMain = touchMode ? 0.42 : 0.8;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo("[data-hero-sub]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: dFast, clearProps: "opacity,visibility,transform" })
        .fromTo("[data-hero-title]", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: dMain, clearProps: "opacity,visibility,transform" }, "-=0.2")
        .fromTo("[data-hero-cta]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: touchMode ? 0.34 : 0.6, clearProps: "opacity,visibility,transform" }, "-=0.3");

      gsap.fromTo(
        "[data-hero-title]",
        { filter: "blur(10px)" },
        { filter: "blur(0px)", duration: touchMode ? 0.45 : 0.9, ease: "power2.out" }
      );

      gsap.utils.toArray<HTMLElement>("[data-reveal], [data-card]").forEach((element) => {
        gsap.from(element, {
          opacity: 0.34,
          y: 10,
          duration: touchMode ? 0.25 : 0.4,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: element,
            start: "top 92%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
            fastScrollEnd: true
          }
        });
      });

      gsap.fromTo(
        "[data-tech-tag]",
        { opacity: 0.4, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: touchMode ? 0.02 : 0.045,
          duration: touchMode ? 0.26 : 0.42,
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
          stagger: touchMode ? 0.02 : 0.05,
          duration: touchMode ? 0.28 : 0.45,
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
          duration: touchMode ? 0.28 : 0.5,
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

      if (!coarse) {
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
      }

      gsap.to("[data-code-cloud-mobile]", {
        yPercent: coarse ? -1.4 : -4,
        ease: "none",
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom top",
          scrub: coarse ? 0.2 : (reduce ? 0.45 : 0.9)
        }
      });

      if (!coarse) {
        gsap.to("[data-code-cloud-mobile]", {
          opacity: 0.62,
          duration: reduce ? 3.3 : 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      }

      if (!coarse) {
        gsap.to("[data-code-cloud]", {
          opacity: 1,
          scrollTrigger: {
            trigger: "[data-hero-title]",
            start: "top 75%",
            end: "bottom top",
            scrub: reduce ? 0.35 : 0.6
          }
        });
      }

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
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
};
