"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/app/admin/actions";

type Props = {
  csrfToken: string;
  projectId: string;
  projectTitle: string;
};

export const DeleteProjectDialog = ({ csrfToken, projectId, projectTitle }: Props): React.JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="text-[11px] text-fg-muted transition-colors hover:text-danger">Delete</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm" />
        <Dialog.Content className="dialog-content fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 border border-line-strong bg-surface p-6 text-fg shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-danger/40 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger">
              <TriangleAlert className="size-5" />
            </span>
            <div>
              <Dialog.Title className="text-xl">Delete case study?</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-fg-muted">
                This permanently deletes <span className="text-danger">{projectTitle}</span> along with its links and tech stack. This can&apos;t be undone.
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button className="border border-line-strong transition hover:border-line-strong">Cancel</Button>
            </Dialog.Close>
            <form action={deleteProject}>
              <input type="hidden" name="csrf" value={csrfToken} />
              <input type="hidden" name="id" value={projectId} />
              <Button className="border border-danger bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger transition hover:bg-[color-mix(in_srgb,var(--danger)_20%,transparent)]">
                <Trash2 className="mr-2 size-4" />
                Delete permanently
              </Button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
