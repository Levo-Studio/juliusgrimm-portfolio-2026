"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";

type ToastProps = {
  message: string;
  tone?: "success" | "error";
  duration?: number;
  onDismiss?: () => void;
};

const TONE_CLASS: Record<NonNullable<ToastProps["tone"]>, { border: string; icon: string; bar: string }> = {
  success: { border: "border-accent/40", icon: "text-accent", bar: "bg-accent" },
  error: { border: "border-danger/40", icon: "text-danger", bar: "bg-danger" }
};

/** Fixed top-right toast with a draining progress bar; the bar's width is the timer. */
export const Toast = ({ message, tone = "success", duration = 4000, onDismiss }: ToastProps): React.JSX.Element | null => {
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const Icon = tone === "success" ? CheckCircle2 : TriangleAlert;
  const tones = TONE_CLASS[tone];

  const close = (): void => {
    if (!rootRef.current) {
      setDismissed(true);
      onDismiss?.();
      return;
    }
    gsap.to(rootRef.current, {
      opacity: 0,
      y: -8,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setDismissed(true);
        onDismiss?.();
      }
    });
  };

  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(root, { opacity: 1, y: 0 });
      const timeout = setTimeout(close, duration);
      return () => clearTimeout(timeout);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: close });
      tl.fromTo(root, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      tl.fromTo(bar, { scaleX: 1 }, { scaleX: 0, duration: duration / 1000, ease: "none" }, "-=0.05");
    });

    return () => ctx.revert();
  }, []);

  if (dismissed) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      className={`fixed top-5 right-5 z-[60] w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-[10px] border ${tones.border} bg-surface shadow-2xl`}
    >
      <div className="flex items-start gap-2.5 p-3.5">
        <Icon className={`mt-0.5 size-4 shrink-0 ${tones.icon}`} />
        <p className="m-0 flex-1 text-[13px] leading-snug text-fg">{message}</p>
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss"
          className="shrink-0 text-fg-faint transition-colors hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="h-[2px] w-full bg-line">
        <div ref={barRef} className={`h-full w-full origin-left ${tones.bar}`} />
      </div>
    </div>
  );
};
