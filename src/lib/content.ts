import type { ColorCategory } from "@/types/project";

export type SurvivalTag = { label: string; color: ColorCategory };

/**
 * The four survival-kit buckets, in display order. Shared between the homepage
 * grid and the admin editor so the captions and color-to-category mapping can't
 * drift between the two.
 */
export const SURVIVAL_KIT_GROUPS: { caption: string; color: ColorCategory }[] = [
  { caption: "Things causing compiling errors.", color: "green" },
  { caption: "Daily damage control.", color: "orange" },
  { caption: "Root access and emotional damage.", color: "red" },
  { caption: "Real-world side quests.", color: "blue" }
];

export const survivalTags: SurvivalTag[] = [
  { label: "React", color: "green" },
  { label: "TypeScript", color: "green" },
  { label: "Next.js", color: "green" },
  { label: "PostgreSQL", color: "green" },
  { label: "CSS", color: "green" },
  { label: "Tailwind", color: "green" },
  { label: "Docker", color: "orange" },
  { label: "Kubernetes", color: "orange" },
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
  { title: "EMAIL", value: "me@juliusgrimm.dev", note: "Ancient technology. Surprisingly reliable. Hate typing it out." },
  { title: "WhatsApp", value: "+49 176 61028522", note: "Convenient. Mildly concerning." },
  { title: "LinkedIn", value: "@julius-gr", note: "Pretending to be professional." },
  { title: "Instagram", value: "@JustThatRandomCoder", note: "Building things publicly instead of sleeping." },
  { title: "GitHub", value: "@justthatrandomcoder", note: "Version-controlled overengineering." }
] as const;

export const levoStudioContactItems = [
  { title: "Website", value: "levo-studio.com", note: "The polished version of this whole page." },
  { title: "EMAIL", value: "julius@levo-studio.com", note: "The one for actual business, not side quests." },
  { title: "LinkedIn", value: "Levo Studio", note: "The professional version of all this." },
  { title: "Instagram", value: "@levo_studio", note: "Behind the scenes of things breaking in production." },
  { title: "GitHub", value: "@levo-studio", note: "Where the client work lives, mostly organized." }
] as const;
