"use client";

import { useState } from "react";
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
    <div className="flex flex-col gap-4">

      <div className="flex flex-col gap-2">
        {/* One row per tag: name, colour, its place in the order, and a way out. */}
        {tags.map((tag, index) => (
          <div
            key={`survival-tag-${index}`}
            className="flex items-center gap-2 rounded-[7px] border border-line px-2.5 py-2"
          >
            <input type="hidden" name="tagSortOrder" value={tag.sortOrder} />
            <input
              name="tagLabel"
              value={tag.label}
              onChange={(event) => updateRow(index, { label: event.target.value })}
              placeholder="e.g. Next.js"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-faint"
            />
            <select
              name="tagColorCategory"
              value={tag.color}
              onChange={(event) => updateRow(index, { color: event.target.value as ColorCategory })}
              aria-label="Colour category"
              className="shrink-0 bg-transparent font-mono text-[10px] text-fg-muted outline-none"
            >
              <option value="green">green</option>
              <option value="orange">orange</option>
              <option value="red">red</option>
              <option value="blue">blue</option>
            </select>
            <button
              type="button"
              onClick={() => moveRow(index, -1)}
              disabled={index === 0}
              aria-label={`Move ${tag.label || "tag"} up`}
              className="shrink-0 px-1 text-[12px] leading-none text-fg-muted transition-colors hover:text-fg disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveRow(index, 1)}
              disabled={index === tags.length - 1}
              aria-label={`Move ${tag.label || "tag"} down`}
              className="shrink-0 px-1 text-[12px] leading-none text-fg-muted transition-colors hover:text-fg disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeRow(index)}
              aria-label={`Remove ${tag.label || "tag"}`}
              className="shrink-0 px-1 text-[13px] leading-none text-fg-muted transition-colors hover:text-danger"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="rounded-md border border-dashed border-line-field py-1.5 text-[11px] text-fg-muted transition-colors hover:border-accent hover:text-fg"
      >
        + Add tag
      </button>

      <details>
        <summary className="cursor-pointer list-none text-[11px] text-fg-muted transition-colors hover:text-fg">
          Common tags
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => addSuggestion(item.label, item.color)}
              className="rounded-[5px] border border-line px-2 py-1 text-[11px] text-fg-muted transition-colors hover:border-accent hover:text-fg"
            >
              {item.label}
            </button>
          ))}
        </div>
      </details>

      {feedback ? <p className="m-0 text-[11px] text-accent">{feedback}</p> : null}
    </div>
  );
};
