"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  trigger: React.ReactNode;
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  confirmIcon?: LucideIcon;
  variant: "danger" | "default";
  formAction: (formData: FormData) => void;
  hiddenFields: Record<string, string>;
};

const TONE_CLASS: Record<Props["variant"], string> = {
  danger: "border-danger/40 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger",
  default: "border-accent/40 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent"
};

export const ConfirmActionDialog = ({
  trigger,
  icon: Icon,
  title,
  description,
  confirmLabel,
  confirmIcon: ConfirmIcon,
  variant,
  formAction,
  hiddenFields
}: Props): React.JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm" />
        <Dialog.Content className="dialog-content fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[10px] border border-line-strong bg-surface p-6 text-fg shadow-2xl">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[7px] border ${TONE_CLASS[variant]}`}>
              <Icon className="size-5" />
            </span>
            <div>
              <Dialog.Title className="m-0 text-[18px] font-light tracking-[-0.02em]">{title}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-fg-muted">{description}</Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">Cancel</Button>
            </Dialog.Close>
            <form action={formAction}>
              {Object.entries(hiddenFields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
              <Button variant={variant}>
                {ConfirmIcon ? <ConfirmIcon className="mr-2 size-4" /> : null}
                {confirmLabel}
              </Button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
