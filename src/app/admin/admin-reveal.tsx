"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const AdminReveal = ({ children, className }: Props): React.JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const cards = scope.querySelectorAll("article, section, [data-admin-card]");
      const items = cards.length > 0 ? cards : scope.children;
      gsap.from(items, {
        opacity: 0,
        y: reduce ? 0 : 16,
        duration: reduce ? 0.25 : 0.5,
        ease: "power2.out",
        stagger: reduce ? 0.02 : 0.06,
        clearProps: "opacity,transform"
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
