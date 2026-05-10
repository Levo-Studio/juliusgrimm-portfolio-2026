import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn("w-full border border-white/30 bg-black p-3 text-white", className)} {...props} />;
});
Input.displayName = "Input";
