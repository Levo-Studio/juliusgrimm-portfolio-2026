"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const words = [
  { text: "I'm" },
  { text: "Julius" },
  { text: "-" },
  { text: "founder," },
  { text: "developer," },
  { text: "and" },
  { text: "professional" },
  { text: "overthinker." },
  { text: "I" },
  { text: "build" },
  { text: "fast" },
  { text: "digital" },
  { text: "products" },
  { text: "with" },
  { text: "an" },
  { text: "unhealthy", highlight: true },
  { text: "attention", highlight: true },
  { text: "to", highlight: true },
  { text: "detail", highlight: true },
  { text: "and", highlight: true },
  { text: "a", highlight: true },
  { text: "tendency", highlight: true },
  { text: "to", highlight: true },
  { text: "overengineer", highlight: true },
  { text: "things", highlight: true },
  { text: "that", highlight: true },
  { text: "worked", highlight: true },
  { text: "fine", highlight: true },
  { text: "before.", highlight: true }
];

export const AboutReveal = (): React.JSX.Element => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.to("[data-about-word]", {
        opacity: 1,
        stagger: reduce ? 0.008 : 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-about-wrap]",
          start: "top 85%",
          end: "bottom 45%",
          scrub: reduce ? 0.4 : 1.1
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <p data-about-wrap className="max-w-[860px] font-instrument text-[42px] leading-[1.08] md:text-[53px]">
      {words.map((word, index) => (
        <span
          key={`${word.text}-${index}`}
          data-about-word
          className={`${word.highlight ? "text-[#5BE38B]" : "text-white"} about-word-initial`}
        >
          {word.text}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
};
