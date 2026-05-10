import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={cn("min-h-24 w-full border border-white/30 bg-black p-3 text-white", className)} {...props} />;
});
Textarea.displayName = "Textarea";
