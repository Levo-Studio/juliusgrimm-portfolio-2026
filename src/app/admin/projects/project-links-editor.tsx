"use client";

import { useState } from "react";

type LinkItem = {
  label: string;
  url: string;
  visible: boolean;
  sortOrder: number;
};

type Props = {
  initialLinks: LinkItem[];
};

export const ProjectLinksEditor = ({ initialLinks }: Props): React.JSX.Element => {
  const [links, setLinks] = useState<LinkItem[]>(
    initialLinks.length > 0 ? initialLinks : [{ label: "", url: "", visible: true, sortOrder: 1 }]
  );

  const updateLink = (index: number, patch: Partial<LinkItem>): void => {
    setLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addLink = (): void => {
    setLinks((prev) => [...prev, { label: "", url: "", visible: true, sortOrder: prev.length + 1 }]);
  };

  const removeLink = (index: number): void => {
    setLinks((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          sortOrder: i + 1
        }))
    );
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Stacked rather than tabular: this lives in a 280px column, so a five-across
          grid would force the whole sidebar wider than the layout allows. */}
      {links.map((link, index) => (
        <div key={`link-${index}`} className="flex flex-col gap-1.5 rounded-[7px] border border-line p-2.5">
          <input type="hidden" name="linkSortOrder" value={link.sortOrder} />
          <input
            name="linkLabel"
            value={link.label}
            onChange={(event) => updateLink(index, { label: event.target.value })}
            placeholder="Label (e.g. GitHub)"
            className="w-full min-w-0 bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-faint"
          />
          <input
            name="linkUrl"
            value={link.url}
            onChange={(event) => updateLink(index, { url: event.target.value })}
            placeholder="https://…"
            className="w-full min-w-0 border-t border-line bg-transparent pt-1.5 font-mono text-[11px] text-fg-muted outline-none placeholder:text-fg-faint"
          />
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-fg-muted">
              <input type="hidden" name="linkVisible" value={link.visible ? "true" : "false"} />
              <input
                type="checkbox"
                checked={link.visible}
                onChange={(event) => updateLink(index, { visible: event.target.checked })}
                className="size-3 accent-[var(--accent)]"
              />
              Visible
            </label>
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="text-[11px] text-fg-muted transition-colors hover:text-danger"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addLink}
        className="rounded-md border border-dashed border-line-field py-1.5 text-[11px] text-fg-muted transition-colors hover:border-accent hover:text-fg"
      >
        + Add link
      </button>
    </div>
  );
};
