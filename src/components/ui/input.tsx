import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn("w-full border border-line-strong bg-bg p-3 text-fg", className)} {...props} />;
});
Input.displayName = "Input";
