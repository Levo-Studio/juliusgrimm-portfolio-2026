import React from "react";
import { Braces } from "lucide-react";
import { colorMap } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { ColorCategory } from "@/types/project";

type ColorTagProps = {
  label: string;
  color: ColorCategory;
};

export const ColorTag = ({ label, color }: ColorTagProps): React.JSX.Element => {
  return (
    <span data-tech-tag className={cn("inline-flex min-w-[132px] items-center gap-2 border px-4 py-2.5 font-inria text-[13px] md:min-w-[180px] md:text-[14px]", colorMap[color])}>
      <Braces className="size-3.5 md:size-4" />
      {label}
    </span>
  );
};
