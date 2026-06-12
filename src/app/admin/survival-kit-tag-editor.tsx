"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ColorCategory } from "@/types/project";

type SurvivalTagItem = {
  label: string;
  color: ColorCategory;
  sortOrder: number;
};

type Props = {
  initialTags: SurvivalTagItem[];
};

const suggestions: Array<{ label: string; color: ColorCategory }> = [
  { label: "React", color: "green" },
  { label: "TypeScript", color: "green" },
  { label: "Next.js", color: "green" },
  { label: "PostgreSQL", color: "green" },
  { label: "CSS", color: "green" },
  { label: "Tailwind", color: "green" },
  { label: "Docker", color: "orange" },
  { label: "Kubernetes", color: "orange" },
  { label: "Zed", color: "orange" },
  { label: "Figma", color: "orange" },
  { label: "MacOS", color: "red" },
  { label: "Fedora", color: "red" },
  { label: "Debian", color: "red" },
  { label: "YubiKeys", color: "red" },
  { label: "Bitwarden", color: "red" },
  { label: "Coffee", color: "red" },
  { label: "Gym", color: "blue" },
  { label: "Tennis", color: "blue" }
];

const emptyRow = (sortOrder: number): SurvivalTagItem => ({ label: "", color: "green", sortOrder });

export const SurvivalKitTagEditor = ({ initialTags }: Props): React.JSX.Element => {
  const [tags, setTags] = useState<SurvivalTagItem[]>(initialTags.length > 0 ? initialTags : [emptyRow(1)]);
  const [feedback, setFeedback] = useState("");

  const updateRow = (index: number, patch: Partial<SurvivalTagItem>): void => {
    setTags((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const normalizeOrder = (items: SurvivalTagItem[]): SurvivalTagItem[] => items.map((item, index) => ({ ...item, sortOrder: index + 1 }));

  const addRow = (): void => {
    setTags((prev) => [...prev, emptyRow(prev.length + 1)]);
    setFeedback("Added a new tag row.");
  };

  const removeRow = (index: number): void => {
    setTags((prev) => normalizeOrder(prev.filter((_, itemIndex) => itemIndex !== index)));
  };

  const moveRow = (index: number, direction: -1 | 1): void => {
    setTags((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const current = next[index];
      const target = next[targetIndex];
      next[index] = target;
      next[targetIndex] = current;
      return normalizeOrder(next);
    });
  };

  const addSuggestion = (label: string, color: ColorCategory): void => {
    const alreadyExists = tags.some((item) => item.label.toLowerCase() === label.toLowerCase());
    if (alreadyExists) {
      setFeedback(`${label} is already in the list.`);
      return;
    }
    setTags((prev) => [...prev, { label, color, sortOrder: prev.length + 1 }]);
    setFeedback(`Added ${label}.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/70">Edit the tags shown in the homepage survival kit section.</p>
        <Button type="button" onClick={addRow} className="border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B]">
          Add tag
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => addSuggestion(item.label, item.color)}
            className="border border-white/20 bg-black px-3 py-1.5 text-xs text-white/80 transition hover:border-[#5BE38B] hover:text-[#5BE38B]"
          >
            + {item.label}
          </button>
        ))}
      </div>

      {feedback ? <p className="text-xs text-[#5BE38B]">{feedback}</p> : null}

      <div className="space-y-3">
        {tags.map((tag, index) => (
          <div key={`survival-tag-${index}`} className="grid gap-2 border border-white/15 bg-[#060606] p-3 md:grid-cols-[1fr_160px_88px_88px_92px]">
            <input type="hidden" name="tagSortOrder" value={tag.sortOrder} />
            <input
              name="tagLabel"
              value={tag.label}
              onChange={(event) => updateRow(index, { label: event.target.value })}
              placeholder="e.g. Next.js"
              className="border border-white/20 bg-black px-3 py-2"
            />
            <select
              name="tagColorCategory"
              value={tag.color}
              onChange={(event) => updateRow(index, { color: event.target.value as ColorCategory })}
              className="border border-white/20 bg-black px-3 py-2"
            >
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
            </select>
            <Button type="button" onClick={() => moveRow(index, -1)} disabled={index === 0} className="border border-white/20 bg-transparent disabled:opacity-40">
              Up
            </Button>
            <Button type="button" onClick={() => moveRow(index, 1)} disabled={index === tags.length - 1} className="border border-white/20 bg-transparent disabled:opacity-40">
              Down
            </Button>
            <Button type="button" onClick={() => removeRow(index)} className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B]">
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
