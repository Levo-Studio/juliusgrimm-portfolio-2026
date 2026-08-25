"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { highlightWords } from "@/lib/text-highlight";

type HighlightedParagraphProps = { children: string; className?: string };

/**
 * Words settle in on load the same way the about-text does — no scroll gate,
 * since case-study copy sits near the top of the page where a visitor lands.
 */
export const HighlightedParagraph = ({ children, className }: HighlightedParagraphProps): React.JSX.Element => {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = children.split(" ");
  const highlighted = highlightWords(words);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    const wordEls = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll("[data-word]"));
    if (wordEls.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wordEls, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordEls,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.012, delay: 0.1 }
      );
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span data-word className={`inline-block will-change-transform ${highlighted[index] ? "text-accent" : ""}`}>
            {word}
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
};
