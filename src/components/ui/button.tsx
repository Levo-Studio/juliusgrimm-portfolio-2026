import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-[12px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // One filled action per view; everything else is a quiet outline.
        default: "bg-accent text-accent-fg hover:opacity-90",
        ghost: "border border-line-strong font-normal text-fg-muted hover:border-line-field hover:text-fg",
        danger: "border border-danger/40 font-normal text-danger hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]"
      },
      size: {
        default: "px-[13px] py-2",
        lg: "px-4 py-2.5"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
