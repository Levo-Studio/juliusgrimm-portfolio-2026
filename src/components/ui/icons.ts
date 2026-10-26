import { createLucideIcon } from "lucide-react";

// lucide-react 1.45 redrew circle-check (the check mark is longer and sits lower). The
// success toast keeps the glyph it has always shown, defined from the earlier icon data.
export const CircleCheck = createLucideIcon("circle-check", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
