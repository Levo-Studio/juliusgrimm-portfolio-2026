import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EyeOff, FileText, FolderOpen, KeyRound, LogOut, Menu, Monitor, Settings, ShieldCheck, Smartphone, Tags, Trash2, TriangleAlert, X } from "lucide-react";
import { CircleCheck } from "@/components/ui/icons";

// SVG contents of every icon the app renders, as drawn by lucide-react 1.14.0. Upstream
// redesigns would silently change the UI, so upgrades must keep these byte-identical.
const glyphs: Array<[string, React.ComponentType<{ className?: string }>, string]> = [
  ["CircleCheck (toast)", CircleCheck, "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>"],
  ["EyeOff", EyeOff, "<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"></path><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"></path><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"></path><path d=\"m2 2 20 20\"></path>"],
  ["FileText", FileText, "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path>"],
  ["FolderOpen", FolderOpen, "<path d=\"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2\"></path>"],
  ["KeyRound", KeyRound, "<path d=\"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z\"></path><circle cx=\"16.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"></circle>"],
  ["LogOut", LogOut, "<path d=\"m16 17 5-5-5-5\"></path><path d=\"M21 12H9\"></path><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path>"],
  ["Menu", Menu, "<path d=\"M4 5h16\"></path><path d=\"M4 12h16\"></path><path d=\"M4 19h16\"></path>"],
  ["Monitor", Monitor, "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"></rect><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"></line><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"></line>"],
  ["Settings", Settings, "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>"],
  ["ShieldCheck", ShieldCheck, "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path><path d=\"m9 12 2 2 4-4\"></path>"],
  ["Smartphone", Smartphone, "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\"></rect><path d=\"M12 18h.01\"></path>"],
  ["Tags", Tags, "<path d=\"M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z\"></path><path d=\"M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193\"></path><circle cx=\"10.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"></circle>"],
  ["Trash2", Trash2, "<path d=\"M10 11v6\"></path><path d=\"M14 11v6\"></path><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"></path><path d=\"M3 6h18\"></path><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path>"],
  ["TriangleAlert", TriangleAlert, "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>"],
  ["X", X, "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>"]
];

const inner = (Icon: React.ComponentType<{ className?: string }>): string => {
  const match = /<svg[^>]*>(.*)<\/svg>/.exec(renderToStaticMarkup(<Icon className="size-4" />));
  if (!match) throw new Error("no svg rendered");
  return match[1];
};

describe("icon glyphs", () => {
  it.each(glyphs)("%s", (_name, Icon, expected) => {
    expect(inner(Icon)).toBe(expected);
  });

  it("keeps the 24px stroke-2 lucide frame", () => {
    const html = renderToStaticMarkup(<CircleCheck className="size-4" />);
    expect(html).toContain('width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"');
    expect(html).toContain('class="lucide lucide-circle-check size-4"');
  });
});
