"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">Project Links</p>
        <Button type="button" onClick={addLink} className="border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B]">
          Add link
        </Button>
      </div>

      {links.map((link, index) => (
        <div key={`link-${index}`} className="grid gap-2 border border-white/15 bg-[#060606] p-3 md:grid-cols-[1fr_1.6fr_120px_90px_90px]">
          <input type="hidden" name="linkSortOrder" value={link.sortOrder} />
          <input
            name="linkLabel"
            value={link.label}
            onChange={(event) => updateLink(index, { label: event.target.value })}
            placeholder="Label (e.g. GitHub)"
            className="border border-white/20 bg-black px-3 py-2"
          />
          <input
            name="linkUrl"
            value={link.url}
            onChange={(event) => updateLink(index, { url: event.target.value })}
            placeholder="https://..."
            className="border border-white/20 bg-black px-3 py-2"
          />
          <select
            name="linkVisible"
            value={link.visible ? "true" : "false"}
            onChange={(event) => updateLink(index, { visible: event.target.value === "true" })}
            className="border border-white/20 bg-black px-3 py-2"
          >
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
          <Button type="button" onClick={() => removeLink(index)} className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B]">
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
};

