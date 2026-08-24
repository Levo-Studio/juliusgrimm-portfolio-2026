"use client";

import { useState, useTransition } from "react";
import { generateCaseStudyDraft } from "@/app/admin/actions";

type Props = {
  csrf: string;
  /** Read from MISTRAL_MODEL so the panel names the model actually in use. */
  model: string;
};

export const AiCaseStudyGenerator = ({ csrf, model }: Props): React.JSX.Element => {
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [drafted, setDrafted] = useState(false);
  const [pending, startTransition] = useTransition();

  const onGenerate = (): void => {
    setError("");
    // Controlled field components listen for these events to fill values and animate.
    window.dispatchEvent(new Event("ai-generate-start"));
    startTransition(async () => {
      try {
        const result = await generateCaseStudyDraft({ prompt, csrf });
        if (!result.ok || !result.draft) {
          setError(result.error ?? "Generation failed. Please retry.");
          return;
        }
        window.dispatchEvent(new CustomEvent("ai-case-study-draft", { detail: result.draft }));
        setDrafted(true);
      } finally {
        window.dispatchEvent(new Event("ai-generate-end"));
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-[10px] border border-line-strong">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">Admin / Generate</span>
        {/* Which of the two steps you are on, so the draft never reads as published. */}
        <span className="flex gap-2 font-mono text-[10px] font-medium tracking-[0.1em]">
          <span className={drafted ? "text-fg-faint" : "text-accent"}>1 PROMPT</span>
          <span className="text-rule">·</span>
          <span className={drafted ? "text-accent" : "text-fg-faint"}>2 DRAFT</span>
        </span>
      </div>

      {drafted ? (
        <div className="flex items-center gap-2.5 border-b border-line bg-[color-mix(in_srgb,var(--draft)_7%,transparent)] px-6 py-3.5">
          <span className="font-mono text-[10px] font-medium tracking-[0.1em] text-draft">◌ DRAFT</span>
          <span className="text-[12px] text-fg-muted">Generated, not published. Review it below — you decide.</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 px-6 py-[26px]">
        <h2 className="m-0 text-[22px] font-light leading-[1.25] tracking-[-0.02em]">What is the thing?</h2>
        <p className="m-0 text-[13px] leading-[1.6] text-fg-muted">
          Two sentences are enough. The rest gets written in your voice — as a draft, never live.
        </p>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="gym tracker, no account, everything local, because every other app wants my data"
          className="min-h-[110px] rounded-lg border border-line-field bg-transparent px-3.5 py-3 text-[14px] leading-[1.65] text-fg-field outline-none focus:border-accent"
        />

        <div className="h-0.5 w-full overflow-hidden bg-tint" aria-hidden>
          {pending ? <div className="ai-shimmer h-full w-full" /> : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-fg-faint">{model}</span>
          <button
            type="button"
            onClick={onGenerate}
            disabled={pending || prompt.trim().length === 0}
            className="rounded-md bg-accent px-3.5 py-[9px] text-[12px] font-medium text-accent-fg transition-opacity disabled:opacity-50"
          >
            {pending ? <span className="ai-dots">Generating</span> : drafted ? "Regenerate" : "Generate draft"}
          </button>
        </div>

        {error ? <p className="m-0 text-[12px] text-danger">{error}</p> : null}
      </div>
    </div>
  );
};
