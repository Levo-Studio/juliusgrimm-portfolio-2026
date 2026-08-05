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
  initialWhyBuilt = ""
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

  return (
    <div ref={rootRef} className="grid gap-3">
      <label className="text-sm text-white/70">Slug</label>
      <input
        name="slug"
        data-fill-target
        value={slug}
        onChange={(event) => onSlugChange(event.target.value)}
        placeholder="my-new-case-study"
        className="border border-white/20 bg-black px-3 py-2"
      />

      <label className="text-sm text-white/70">Title</label>
      <input
        name="title"
        data-fill-target
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Case Study Title"
        className="border border-white/20 bg-black px-3 py-2"
      />

      <label className="text-sm text-white/70">Subtitle</label>
      <input
        name="subtitle"
        data-fill-target
        value={subtitle}
        onChange={(event) => setSubtitle(event.target.value)}
        placeholder="Short subtitle in your style"
        className="border border-white/20 bg-black px-3 py-2"
      />

      <label className="text-sm text-white/70">Description</label>
      <textarea
        name="description"
        data-fill-target
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Project description..."
        className="min-h-32 border border-white/20 bg-black px-3 py-2"
      />

      <label className="text-sm text-white/70">Why built it</label>
      <textarea
        name="whyBuilt"
        data-fill-target
        value={whyBuilt}
        onChange={(event) => setWhyBuilt(event.target.value)}
        placeholder="Why you built it..."
        className="min-h-32 border border-white/20 bg-black px-3 py-2"
      />
    </div>
  );
};
