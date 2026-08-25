"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type AboutTextProps = { children: string };

/**
 * The about line animates on load rather than on scroll: it sits high enough on the
 * page that gating it behind a scroll just delayed the first thing anyone reads.
 * Words settle in on a fast stagger; with reduced motion they are simply there.
 */
export const AboutText = ({ children }: AboutTextProps): React.JSX.Element => {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    const words = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll("[data-word]"));
    if (words.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(words, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.018, delay: 0.1 }
      );
    }, scope);

    return () => ctx.revert();
  }, []);

  // Words (or phrases) wrapped in *asterisks* in the source string are hand-picked to
  // highlight — the emphasis is chosen for what it says, not run through the
  // random-per-word algorithm the case-study copy uses. A phrase can span several
  // words: "*professional overthinker*" opens on the first word and closes on the last.
  const rawWords = children.split(" ");
  let openPhrase = false;
  const words = rawWords.map((word) => {
    let display = word;
    let highlighted = openPhrase;

    if (!openPhrase && display.startsWith("*")) {
      display = display.slice(1);
      highlighted = true;
      openPhrase = true;
    }
    if (openPhrase && display.endsWith("*")) {
      display = display.slice(0, -1);
      openPhrase = false;
    }

    return { display, highlighted };
  });

  return (
    <p
      ref={ref}
      className="m-0 max-w-[56ch] text-[15px] leading-[1.6] text-pretty md:text-[17px] md:leading-[1.62] lg:max-w-[63ch]"
    >
      {/* The hidden start is CSS behind .reveal-ready, set by the pre-paint script —
          without JS the words are simply visible instead of stuck at zero opacity. */}
      {words.map(({ display, highlighted }, index) => (
        <span key={`${display}-${index}`}>
          <span
            data-word
            className={`inline-block will-change-transform ${highlighted ? "text-accent" : ""}`}
          >
            {display}
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
};
