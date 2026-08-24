"use client";

import { useEffect, useState } from "react";

type Theme = "auto" | "light" | "dark";

const OPTIONS: { value: Theme; glyph: string; label: string }[] = [
  { value: "auto", glyph: "A", label: "Match system theme" },
  { value: "light", glyph: "☀", label: "Light theme" },
  { value: "dark", glyph: "☾", label: "Dark theme" }
];

const apply = (theme: Theme): void => {
  if (theme === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
};

type ThemeToggleProps = { compact?: boolean };

export const ThemeToggle = ({ compact = false }: ThemeToggleProps): React.JSX.Element => {
  // Starts as "auto" on both server and client so the first client render matches
  // the server HTML; the stored value is adopted in the effect below.
  const [theme, setTheme] = useState<Theme>("auto");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark" || stored === "auto") setTheme(stored);
    } catch {
      /* storage unavailable (private mode, blocked cookies) — stay on auto */
    }
  }, []);

  const select = (next: Theme): void => {
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* not persisting is fine; the choice still applies for this page view */
    }
  };

  const size = compact ? "h-[18px] w-5 text-[9px]" : "h-5 w-[22px] text-[10px]";

  return (
    <div className="flex gap-0.5 rounded-full border border-line-strong p-0.5" role="group" aria-label="Theme">
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => select(option.value)}
            aria-label={option.label}
            aria-pressed={active}
            className={`grid place-items-center rounded-full font-mono font-medium transition-colors duration-150 ${size} ${
              active ? "bg-tint text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            {option.glyph}
          </button>
        );
      })}
    </div>
  );
};
