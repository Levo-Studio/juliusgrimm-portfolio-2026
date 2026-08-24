import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center whitespace-nowrap text-sm transition-colors disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      default: "border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent",
      ghost: "border border-line-strong text-fg"
    },
    size: {
      default: "px-4 py-2",
      lg: "px-6 py-3"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
