import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Toast } from "@/components/ui/toast";

// The success toast's check mark as drawn by lucide-react 1.14.0. lucide 1.45 redrew
// circle-check (CheckCircle2 now renders the new drawing), so the toast must keep using
// the pinned icon to look the same as before the upgrade.
const firstIcon = (html: string): { className: string; inner: string } => {
  const match = /<svg[^>]*class="([^"]*)"[^>]*>(.*?)<\/svg>/.exec(html);
  if (!match) throw new Error("no icon rendered");
  return { className: match[1], inner: match[2] };
};

describe("Toast icon", () => {
  it("renders the original circle-check glyph for success", () => {
    const icon = firstIcon(renderToStaticMarkup(<Toast message="Saved." />));
    expect(icon.inner).toBe('<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>');
    expect(icon.className).toBe("lucide lucide-circle-check mt-0.5 size-4 shrink-0 text-accent");
  });

  it("renders the triangle-alert glyph for errors", () => {
    const icon = firstIcon(renderToStaticMarkup(<Toast message="Failed." tone="error" />));
    expect(icon.inner).toBe('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>');
    expect(icon.className).toContain("lucide-triangle-alert");
  });
});
