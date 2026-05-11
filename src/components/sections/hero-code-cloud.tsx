"use client";

import { useEffect, useState } from "react";

const lowChars = ".,:;`' ";
const midChars = "iIl1|![](){}<>+-_~";
const highChars = "uvvvuuvv";

const pick = (value: string): string => value[Math.floor(Math.random() * value.length)] ?? " ";
const stablePick = (value: string, row: number, col: number): string => value[(row * 7 + col * 11) % value.length] ?? " ";

const createStableRows = (): string[] =>
  Array.from({ length: 34 }, (_, row) =>
    Array.from({ length: 32 }, (_, col) => {
      const density = col / 32;
      if (density > 0.78) return stablePick(highChars, row, col);
      if (density > 0.52) return stablePick(midChars, row, col);
      if (density > 0.36) return stablePick(midChars + lowChars, row, col);
      return stablePick(lowChars, row, col);
    }).join("")
  );

const createRows = (): string[] =>
  Array.from({ length: 34 }, () =>
    Array.from({ length: 32 }, (_, col) => {
      const density = col / 32;
      if (density > 0.78) return pick(highChars);
      if (density > 0.52) return Math.random() < 0.88 ? pick(midChars) : pick(lowChars);
      if (density > 0.36) return Math.random() < 0.58 ? pick(midChars) : pick(lowChars);
      return Math.random() < 0.22 ? pick(midChars) : pick(lowChars);
    }).join("")
  );

export const HeroCodeCloud = (): React.JSX.Element => {
  const [rows, setRows] = useState<string[]>(() => createStableRows());

  useEffect(() => {
    setRows(createRows());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (media.matches || coarse) return;
    const intervalId = window.setInterval(() => setRows(createRows()), 2600);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
    <div data-code-cloud-mobile className="pointer-events-none absolute inset-0 z-0 flex items-center opacity-50 md:hidden">
      <div className="hero-code-mask-mobile ml-[30%] w-[80%] text-right text-[17px] leading-[1.58] text-white/[0.24]">
            {rows.map((row, index) => (
          <p key={`m-${row}-${index}`} className="m-0 select-none font-mono tracking-[0.14em]">
            {row}
          </p>
        ))}
      </div>
    </div>
    <div data-code-cloud className="pointer-events-none absolute right-[-116px] top-1/2 z-0 hidden h-[790px] w-[640px] -translate-y-1/2 opacity-95 md:block">
      <div className="hero-code-mask h-full w-full text-right text-[26px] leading-[1.3] text-white/[0.26]">
        {rows.map((row, index) => (
          <p key={`${row}-${index}`} className="m-0 select-none font-mono tracking-[0.16em]">
            {row}
          </p>
        ))}
      </div>
    </div>
    </>
  );
};
