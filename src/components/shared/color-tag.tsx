import React from "react";
import {
  Atom,
  Binary,
  Box,
  Cat,
  Coffee,
  Database,
  Dumbbell,
  FileJson2,
  PenTool,
  KeyRound,
  Laptop,
  Palette,
  CircleDot,
  Server,
  ShieldCheck,
  Sparkles,
  Spline,
  Wind
} from "lucide-react";
import { colorMap } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { ColorCategory } from "@/types/project";

type ColorTagProps = {
  label: string;
  color: ColorCategory;
};

const iconByLabel: Record<string, React.ComponentType<{ className?: string }>> = {
  React: Atom,
  TypeScript: FileJson2,
  "Next.js": Sparkles,
  PostgreSQL: Database,
  CSS: Palette,
  Tailwind: Wind,
  Docker: Box,
  Kubernetes: Server,
  Coolify: Spline,
  Zed: Binary,
  Figma: PenTool,
  MacOS: Laptop,
  Fedora: Laptop,
  Debian: Server,
  YubiKeys: KeyRound,
  Bitwarden: ShieldCheck,
  Coffee,
  Gym: Dumbbell,
  Tennis: CircleDot,
  "My Cat": Cat
};

export const ColorTag = ({ label, color }: ColorTagProps): React.JSX.Element => {
  const Icon = iconByLabel[label] ?? Binary;

  return (
    <span data-tech-tag className={cn("inline-flex min-w-[132px] items-center gap-2 border px-4 py-2.5 font-inria text-[13px] md:min-w-[180px] md:text-[14px]", colorMap[color])}>
      <Icon className="size-3.5 md:size-4" />
      {label}
    </span>
  );
};
