"use client";

import { useState } from "react";
import type { ColorCategory } from "@/types/project";
import { SURVIVAL_KIT_GROUPS } from "@/lib/content";

type SurvivalTagItem = { label: string; color: ColorCategory; sortOrder: number };

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

/**
 * Groups are the source of truth for color: a tag's color is which container it
 * lives in, not a field the admin sets separately, so the two can't drift apart.
 */
type Groups = Record<ColorCategory, string[]>;

const buildGroups = (tags: SurvivalTagItem[]): Groups => {
  const groups: Groups = { green: [], orange: [], red: [], blue: [] };
  for (const tag of tags) groups[tag.color].push(tag.label);
  return groups;
};

export const SurvivalKitTagEditor = ({ initialTags }: Props): React.JSX.Element => {
  const [groups, setGroups] = useState<Groups>(() => buildGroups(initialTags));
  const [feedback, setFeedback] = useState("");

  const updateLabel = (color: ColorCategory, index: number, label: string): void => {
    setGroups((prev) => {
      const next = { ...prev, [color]: [...prev[color]] };
      next[color][index] = label;
      return next;
    });
  };

  const addRow = (color: ColorCategory): void => {
    setGroups((prev) => ({ ...prev, [color]: [...prev[color], ""] }));
  };

  const removeRow = (color: ColorCategory, index: number): void => {
    setGroups((prev) => ({ ...prev, [color]: prev[color].filter((_, itemIndex) => itemIndex !== index) }));
  };

  const moveRow = (color: ColorCategory, index: number, direction: -1 | 1): void => {
    setGroups((prev) => {
      const list = prev[color];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const next = [...list];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return { ...prev, [color]: next };
    });
  };

  const addSuggestion = (label: string, color: ColorCategory): void => {
    const alreadyExists = Object.values(groups)
      .flat()
      .some((existing) => existing.toLowerCase() === label.toLowerCase());
    if (alreadyExists) {
      setFeedback(`${label} is already in the list.`);
      return;
    }
    setGroups((prev) => ({ ...prev, [color]: [...prev[color], label] }));
    setFeedback(`Added ${label}.`);
  };

  // Flattened once, in group display order, so sortOrder and the hidden form
  // inputs line up with what actually renders.
  let sortOrder = 0;

  return (
    <div className="flex flex-col gap-6">
      {SURVIVAL_KIT_GROUPS.map((group) => (
        <div key={group.color} className="flex flex-col gap-3 rounded-[10px] border border-line-strong bg-surface p-4">
          <p className="m-0 text-[11px] text-fg-muted">{group.caption}</p>

          <div className="flex flex-col gap-2">
            {groups[group.color].map((label, index) => {
              const order = sortOrder++;
              return (
                <div
                  key={`${group.color}-${index}`}
                  className="flex items-center gap-2 rounded-[7px] border border-line bg-bg px-2.5 py-2"
                >
                  <input type="hidden" name="tagColorCategory" value={group.color} />
                  <input type="hidden" name="tagSortOrder" value={order} />
                  <input
                    name="tagLabel"
                    value={label}
                    onChange={(event) => updateLabel(group.color, index, event.target.value)}
                    placeholder="e.g. Next.js"
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-faint"
                  />
                  <button
                    type="button"
                    onClick={() => moveRow(group.color, index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${label || "tag"} up`}
                    className="shrink-0 px-1 text-[12px] leading-none text-fg-muted transition-colors hover:text-fg disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRow(group.color, index, 1)}
                    disabled={index === groups[group.color].length - 1}
                    aria-label={`Move ${label || "tag"} down`}
                    className="shrink-0 px-1 text-[12px] leading-none text-fg-muted transition-colors hover:text-fg disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRow(group.color, index)}
                    aria-label={`Remove ${label || "tag"}`}
                    className="shrink-0 px-1 text-[13px] leading-none text-fg-muted transition-colors hover:text-danger"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => addRow(group.color)}
            className="rounded-md border border-dashed border-line-field py-1.5 text-[11px] text-fg-muted transition-colors hover:border-accent hover:text-fg"
          >
            + Add tag
          </button>
        </div>
      ))}

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
