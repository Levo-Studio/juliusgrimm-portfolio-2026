import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={cn("min-h-24 w-full rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] leading-[1.7] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent", className)} {...props} />;
});
Textarea.displayName = "Textarea";
