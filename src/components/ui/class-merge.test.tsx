import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionShell } from "@/components/shared/section-shell";
import { CreateSubmitButton } from "@/app/admin/projects/create-submit-button";

// Every cn()/twMerge call site in the app, rendered with the props it is actually used with.
// Expected strings were captured with tailwind-merge 2.5.4; a different merge result would
// change the rendered styles, so these must stay byte-identical across upgrades.
const classOf = (element: React.ReactElement): string => {
  const match = /class="([^"]*)"/.exec(renderToStaticMarkup(element));
  if (!match) throw new Error("no class attribute rendered");
  return match[1];
};

describe("rendered class names", () => {
  it.each([
    [
      "Button (default)",
      <Button key="b">x</Button>,
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-[12px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-accent text-accent-fg hover:opacity-90 px-[13px] py-2"
    ],
    [
      "Button ghost",
      <Button key="b" variant="ghost">x</Button>,
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-[12px] transition-colors disabled:pointer-events-none disabled:opacity-50 border border-line-strong font-normal text-fg-muted hover:border-line-field hover:text-fg px-[13px] py-2"
    ],
    [
      "Button danger",
      <Button key="b" variant="danger">x</Button>,
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-[12px] transition-colors disabled:pointer-events-none disabled:opacity-50 border border-danger/40 font-normal text-danger hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-[13px] py-2"
    ],
    [
      "Button lg",
      <Button key="b" size="lg">x</Button>,
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-[12px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-accent text-accent-fg hover:opacity-90 px-4 py-2.5"
    ],
    [
      "Button justify-self-start",
      <Button key="b" className="justify-self-start">x</Button>,
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-[12px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-accent text-accent-fg hover:opacity-90 px-[13px] py-2 justify-self-start"
    ],
    [
      "Button with colour/size overrides",
      <Button key="b" className="rounded-md bg-fg px-[13px] py-2 text-[12px] font-medium text-bg">x</Button>,
      "inline-flex items-center justify-center whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 hover:opacity-90 rounded-md bg-fg px-[13px] py-2 text-[12px] font-medium text-bg"
    ],
    [
      "CreateSubmitButton",
      <CreateSubmitButton key="b">x</CreateSubmitButton>,
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-[12px] font-medium disabled:pointer-events-none bg-accent text-accent-fg hover:opacity-90 px-[13px] py-2 transition disabled:cursor-not-allowed disabled:opacity-40"
    ],
    [
      "Input",
      <Input key="i" />,
      "w-full rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent"
    ],
    [
      "Textarea",
      <Textarea key="t" />,
      "min-h-24 w-full rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] leading-[1.7] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent"
    ],
    [
      "SectionShell",
      <SectionShell key="s" label="l">x</SectionShell>,
      "grid grid-cols-1 gap-x-10 gap-y-3 lg:grid-cols-[120px_minmax(0,1fr)]"
    ],
    [
      "SectionShell wide",
      <SectionShell key="s" label="l" className="lg:grid-cols-[120px_minmax(0,min(1380px,60vw))]">x</SectionShell>,
      "grid grid-cols-1 gap-x-10 gap-y-3 lg:grid-cols-[120px_minmax(0,min(1380px,60vw))]"
    ]
  ])("%s", (_name, element, expected) => {
    expect(classOf(element)).toBe(expected);
  });
});
