"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ColorCategory = "green" | "orange" | "red" | "blue";

type TechItem = {
  label: string;
  colorCategory: ColorCategory;
  sortOrder: number;
};

type Props = {
  initialTech: TechItem[];
};

const suggestions: Array<{ label: string; colorCategory: ColorCategory }> = [
  { label: "React", colorCategory: "green" },
  { label: "TypeScript", colorCategory: "green" },
  { label: "Next.js", colorCategory: "green" },
  { label: "PostgreSQL", colorCategory: "green" },
  { label: "Tailwind", colorCategory: "green" },
  { label: "CSS", colorCategory: "green" },
  { label: "Docker", colorCategory: "orange" },
  { label: "Coolify", colorCategory: "orange" },
  { label: "Zed", colorCategory: "orange" },
  { label: "Figma", colorCategory: "orange" },
  { label: "Vite", colorCategory: "green" },
  { label: "React Router", colorCategory: "green" },
  { label: "Framer Motion", colorCategory: "blue" },
  { label: "GSAP", colorCategory: "blue" },
  { label: "Matrix", colorCategory: "blue" },
  { label: "Node.js", colorCategory: "green" }
];

const emptyRow = (sortOrder: number): TechItem => ({ label: "", colorCategory: "green", sortOrder });

export const ProjectTechEditor = ({ initialTech }: Props): React.JSX.Element => {
  const [tech, setTech] = useState<TechItem[]>(initialTech.length > 0 ? initialTech : [emptyRow(1)]);
  const [feedback, setFeedback] = useState<string>("");

  const updateRow = (index: number, patch: Partial<TechItem>): void => {
    setTech((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addRow = (): void => {
    setTech((prev) => [...prev, emptyRow(prev.length + 1)]);
    setFeedback("Added a new tool/framework row.");
  };

  const removeRow = (index: number): void => {
    setTech((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          sortOrder: i + 1
        }))
    );
  };

  const addSuggestion = (label: string, colorCategory: ColorCategory): void => {
    setTech((prev) => {
      if (prev.some((item) => item.label.toLowerCase() === label.toLowerCase())) return prev;
      return [...prev, { label, colorCategory, sortOrder: prev.length + 1 }];
    });

    const alreadyExists = tech.some((item) => item.label.toLowerCase() === label.toLowerCase());
    setFeedback(alreadyExists ? `${label} is already in the list.` : `Added ${label}.`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">Frameworks & Tech Stack</p>
        <Button type="button" onClick={addRow} className="border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B]">
          Add tech
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => addSuggestion(item.label, item.colorCategory)}
            className="border border-white/20 bg-black px-3 py-1.5 text-xs text-white/80 transition hover:border-[#5BE38B] hover:text-[#5BE38B]"
          >
            + {item.label}
          </button>
        ))}
      </div>

      {feedback ? <p className="text-xs text-[#5BE38B]">{feedback}</p> : null}

      {tech.map((item, index) => (
        <div key={`tech-${index}`} className="grid gap-2 border border-white/15 bg-[#060606] p-3 md:grid-cols-[1.3fr_160px_90px_90px]">
          <input type="hidden" name="techSortOrder" value={item.sortOrder} />
          <input
            name="techLabel"
            value={item.label}
            onChange={(event) => updateRow(index, { label: event.target.value })}
            placeholder="e.g. Next.js"
            className="border border-white/20 bg-black px-3 py-2"
          />
          <select
            name="techColorCategory"
            value={item.colorCategory}
            onChange={(event) => updateRow(index, { colorCategory: event.target.value as ColorCategory })}
            className="border border-white/20 bg-black px-3 py-2"
          >
            <option value="green">Green</option>
            <option value="orange">Orange</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
          </select>
          <Button type="button" onClick={() => removeRow(index)} className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B]">
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
};

