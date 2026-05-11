import type { ColorCategory } from "@/types/project";

export type SurvivalTag = { label: string; color: ColorCategory };

export const survivalTags: SurvivalTag[] = [
  { label: "React", color: "green" },
  { label: "TypeScript", color: "green" },
  { label: "Next.js", color: "green" },
  { label: "PostgreSQL", color: "green" },
  { label: "CSS", color: "green" },
  { label: "Tailwind", color: "green" },
  { label: "Docker", color: "orange" },
  { label: "Coolify", color: "orange" },
  { label: "Zed", color: "orange" },
  { label: "Figma", color: "orange" },
  { label: "MacOS", color: "red" },
  { label: "Fedora", color: "red" },
  { label: "Debian", color: "red" },
  { label: "YubiKeys", color: "red" },
  { label: "Bitwarden", color: "red" },
  { label: "Coffee", color: "red" },
  { label: "Gym", color: "blue" },
  { label: "Tennis", color: "blue" },
  { label: "My Cat", color: "blue" }
];

export const contactItems = [
  { title: "EMAIL", value: "me@juliusgrimm.dev", note: "Ancient technology. Surprisingly reliable." },
  { title: "WhatsApp", value: "+49 176 61028522", note: "Convenient. Mildly concerning." },
  { title: "Matrix", value: "@levostudio:chat.orbitaly.de", note: "Running on my own servers because trust issues." },
  { title: "LinkedIn", value: "@julius_gr", note: "Pretending to be professional." },
  { title: "Instagram", value: "@julius_gr_", note: "Building things publicly instead of sleeping." },
  { title: "GitHub", value: "@justthatrandomcoder", note: "Version-controlled overengineering." }
] as const;
