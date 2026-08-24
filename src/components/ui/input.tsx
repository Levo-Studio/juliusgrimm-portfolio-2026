import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn("w-full rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent", className)} {...props} />;
});
Input.displayName = "Input";
