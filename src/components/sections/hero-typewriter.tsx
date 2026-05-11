"use client";

import { useEffect } from "react";
import gsap from "gsap";

const lineOneWords = ["Founder", "on", "accident."];
const lineTwoWords = ["Engineer", "by", "design."];

export const HeroTypewriter = (): React.JSX.Element => {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.set("[data-hero-word]", { opacity: 0.3 });
      gsap.to("[data-hero-word]", {
        opacity: 1,
        stagger: reduce ? 0.03 : 0.085,
        duration: reduce ? 0.22 : 0.42,
        delay: reduce ? 0.35 : 0.95,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <h1 data-hero-title className="mt-4 max-w-[560px] font-instrument text-[clamp(44px,11.5vw,66px)] leading-[0.93] tracking-[-0.012em] md:mt-6 md:text-[70px]">
      <span className="block whitespace-nowrap">
        {lineOneWords.map((word, index) => (
          <span key={`${word}-${index}`} data-hero-word className="about-word-initial">
            {word}
            {index < lineOneWords.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
      <span className="block whitespace-nowrap text-[#5BE38B]">
        {lineTwoWords.map((word, index) => (
          <span key={`${word}-${index}`} data-hero-word className="about-word-initial text-[#5BE38B]">
            {word}
            {index < lineTwoWords.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </h1>
  );
};
