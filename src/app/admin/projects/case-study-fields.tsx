"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type Draft = {
  title: string;
  subtitle: string;
  description: string;
  whyBuilt: string;
};

type Props = {
  initialSlug?: string;
  initialTitle?: string;
  initialSubtitle?: string;
  initialDescription?: string;
  initialWhyBuilt?: string;
  /** Sidebar content above the slug (project links) and below it (date, stack, actions). */
  sidebarBefore?: React.ReactNode;
  sidebarAfter?: React.ReactNode;
};

// Mirrors the server-side slugify in admin/actions.ts so the previewed slug matches what gets saved.
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const CaseStudyFields = ({
  initialSlug = "",
  initialTitle = "",
  initialSubtitle = "",
  initialDescription = "",
  initialWhyBuilt = "",
  sidebarBefore,
  sidebarAfter
}: Props): React.JSX.Element => {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [description, setDescription] = useState(initialDescription);
  const [whyBuilt, setWhyBuilt] = useState(initialWhyBuilt);
  const [slugEdited, setSlugEdited] = useState(initialSlug.trim().length > 0);

  const rootRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<gsap.core.Tween | null>(null);

  const targets = (): HTMLElement[] =>
    rootRef.current ? gsap.utils.toArray<HTMLElement>(rootRef.current.querySelectorAll("[data-fill-target]")) : [];

  const onTitleChange = (value: string): void => {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const onSlugChange = (value: string): void => {
    setSlug(value);
    setSlugEdited(value.trim().length > 0);
  };

  // Broadcast whether the required fields are complete so the submit buttons can enable/disable.
  useEffect(() => {
    const complete =
      title.trim().length >= 2 &&
      subtitle.trim().length >= 2 &&
      description.trim().length >= 10 &&
      whyBuilt.trim().length >= 10;
    window.dispatchEvent(new CustomEvent("case-study-validity", { detail: { complete } }));
  }, [title, subtitle, description, whyBuilt]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stopPulse = (): void => {
      if (pulseRef.current) {
        pulseRef.current.kill();
        pulseRef.current = null;
      }
      gsap.to(targets(), { boxShadow: "none", borderColor: "rgba(255,255,255,0.2)", duration: 0.2, clearProps: "boxShadow,borderColor" });
    };

    const onStart = (): void => {
      if (reduce) return;
      pulseRef.current?.kill();
      pulseRef.current = gsap.to(targets(), {
        borderColor: "rgba(91,227,139,0.55)",
        boxShadow: "0 0 10px rgba(91,227,139,0.18)",
        duration: 0.7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.12, from: "start" }
      });
    };

    const onDraft = (event: Event): void => {
      const draft = (event as CustomEvent<Draft>).detail;
      if (!draft) return;
      setTitle(draft.title);
      setSlug(slugify(draft.title));
      setSlugEdited(false);
      setSubtitle(draft.subtitle);
      setDescription(draft.description);
      setWhyBuilt(draft.whyBuilt);

      stopPulse();
      if (reduce) return;
      gsap.fromTo(
        targets(),
        { borderColor: "rgba(91,227,139,1)", boxShadow: "0 0 16px rgba(91,227,139,0.5)" },
        {
          borderColor: "rgba(255,255,255,0.2)",
          boxShadow: "0 0 0px rgba(91,227,139,0)",
          duration: 0.65,
          ease: "power2.out",
          stagger: 0.09,
          clearProps: "boxShadow,borderColor"
        }
      );
    };

    window.addEventListener("ai-generate-start", onStart);
    window.addEventListener("ai-generate-end", stopPulse);
    window.addEventListener("ai-case-study-draft", onDraft);
    return () => {
      window.removeEventListener("ai-generate-start", onStart);
      window.removeEventListener("ai-generate-end", stopPulse);
      window.removeEventListener("ai-case-study-draft", onDraft);
      pulseRef.current?.kill();
    };
  }, []);

  const label = "font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted";
  const body =
    "rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] leading-[1.7] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent";

  return (
    <div ref={rootRef} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-6 border-line px-5 py-7 md:border-r md:px-8">
        <div className="flex flex-col gap-2">
          <label htmlFor="new-title" className={label}>Title</label>
          <input
            id="new-title"
            name="title"
            data-fill-target
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Case study title"
            className="border-b border-line-field bg-transparent pt-1 pb-2 text-[24px] tracking-[-0.02em] outline-none placeholder:text-fg-faint focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-subtitle" className={label}>One-liner</label>
          <input
            id="new-subtitle"
            name="subtitle"
            data-fill-target
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            placeholder="Short subtitle in your style"
            className="border-b border-line bg-transparent pt-1.5 pb-2 text-[14px] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-description" className={label}>Context</label>
          <textarea
            id="new-description"
            name="description"
            data-fill-target
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What it is, and why it exists…"
            className={`min-h-[190px] ${body}`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="new-why" className={label}>Why I built it</label>
          <textarea
            id="new-why"
            name="whyBuilt"
            data-fill-target
            value={whyBuilt}
            onChange={(event) => setWhyBuilt(event.target.value)}
            placeholder="The itch it scratched…"
            className={`min-h-[150px] ${body}`}
          />
        </div>
      </div>

      <aside className="flex min-w-0 flex-col gap-[22px] px-5 py-7 md:px-6">
        {sidebarBefore}

        <div className="flex flex-col gap-2">
          <label htmlFor="new-slug" className={label}>Slug</label>
          <input
            id="new-slug"
            name="slug"
            data-fill-target
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            placeholder="my-new-case-study"
            className="rounded-[7px] border border-line bg-transparent px-2.5 py-2 font-mono text-[12px] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent"
          />
          {/* Derived from the title until you type here, then it stops following. */}
        </div>

        {sidebarAfter}
      </aside>
    </div>
  );
};
