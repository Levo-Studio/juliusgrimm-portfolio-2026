"use client";

import { useEffect, useState } from "react";

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

  // Accept a tech stack pushed by the AI case study generator.
  useEffect(() => {
    const handler = (event: Event): void => {
      const detail = (event as CustomEvent<{ techStack?: Array<{ label: string; colorCategory: ColorCategory }> }>).detail;
      const stack = detail?.techStack;
      if (!Array.isArray(stack) || stack.length === 0) return;
      setTech(stack.map((item, index) => ({ label: item.label, colorCategory: item.colorCategory, sortOrder: index + 1 })));
      setFeedback(`Filled ${stack.length} tech tags from the AI draft.`);
    };
    window.addEventListener("ai-case-study-draft", handler);
    return () => window.removeEventListener("ai-case-study-draft", handler);
  }, []);

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
    <div className="flex flex-col gap-2.5">
      {/* Each tag is one compact row: the name, its colour, and a way out. The old
          four-column grid could not fit the sidebar without widening the layout. */}
      {tech.map((item, index) => (
        <div key={`tech-${index}`} className="flex items-center gap-2 rounded-[7px] border border-line px-2.5 py-2">
          <input type="hidden" name="techSortOrder" value={item.sortOrder} />
          <input
            name="techLabel"
            value={item.label}
            onChange={(event) => updateRow(index, { label: event.target.value })}
            placeholder="e.g. Next.js"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-faint"
          />
          <select
            name="techColorCategory"
            value={item.colorCategory}
            onChange={(event) => updateRow(index, { colorCategory: event.target.value as ColorCategory })}
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
            onClick={() => removeRow(index)}
            aria-label={`Remove ${item.label || "tag"}`}
            className="shrink-0 text-[13px] leading-none text-fg-muted transition-colors hover:text-danger"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="rounded-md border border-dashed border-line-field py-1.5 text-[11px] text-fg-muted transition-colors hover:border-accent hover:text-fg"
      >
        + Add tech
      </button>

      <details className="group">
        <summary className="cursor-pointer list-none text-[11px] text-fg-muted transition-colors hover:text-fg">
          Common tags
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => addSuggestion(item.label, item.colorCategory)}
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
