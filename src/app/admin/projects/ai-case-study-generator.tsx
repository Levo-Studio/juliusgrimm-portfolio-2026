"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateCaseStudyDraft } from "@/app/admin/actions";

type Props = {
  csrf: string;
};

export const AiCaseStudyGenerator = ({ csrf }: Props): React.JSX.Element => {
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const onGenerate = (): void => {
    setError("");
    setNotice("");
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
        setNotice("Draft generated. Review and tweak everything below before saving.");
      } finally {
        window.dispatchEvent(new Event("ai-generate-end"));
      }
    });
  };

  return (
    <div className="grid gap-3 border border-[#5BE38B]/40 bg-[rgba(91,227,139,0.05)] p-5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-[#5BE38B]">Describe the case study</label>
        <Button
          type="button"
          onClick={onGenerate}
          disabled={pending}
          className="border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B] transition hover:bg-[rgba(91,227,139,0.2)] disabled:opacity-70"
        >
          {pending ? <span className="ai-dots">Generating</span> : "Generate with AI"}
        </Button>
      </div>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="e.g. VibeVote is an interactive song-requesting platform to replace paper requests and chaotic aux handovers at parties..."
        className="min-h-28 border border-white/20 bg-black px-3 py-2"
      />
      <div className="h-0.5 w-full overflow-hidden bg-white/10" aria-hidden>
        {pending ? <div className="ai-shimmer h-full w-full" /> : null}
      </div>
      <p className="text-xs text-white/50">Fills in title, subtitle, description, why-built and tech stack in your voice. You can edit all of it before saving.</p>
      {error ? <p className="text-xs text-[#E35B5B]">{error}</p> : null}
      {notice ? <p className="text-xs text-[#5BE38B]">{notice}</p> : null}
    </div>
  );
};
