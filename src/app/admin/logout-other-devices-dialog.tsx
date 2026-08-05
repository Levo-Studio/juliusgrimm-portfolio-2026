"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutOtherDevices } from "@/app/admin/actions";

type Props = {
  csrfToken: string;
};

export const LogoutOtherDevicesDialog = ({ csrfToken }: Props): React.JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B] transition hover:bg-[rgba(227,91,91,0.2)]">
          <LogOut className="mr-2 size-4" />
          Log out other devices
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="dialog-content fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 border border-white/15 bg-[#0a0a0a] p-6 text-white shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-[#E35B5B]/40 bg-[rgba(227,91,91,0.1)] text-[#E35B5B]">
              <TriangleAlert className="size-5" />
            </span>
            <div>
              <Dialog.Title className="font-inria text-xl">Log out other devices?</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-white/70">
                This signs out every other active session. This device stays logged in; all others will need to sign in again.
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button className="border border-white/25 transition hover:border-white/40">Cancel</Button>
            </Dialog.Close>
            <form action={logoutOtherDevices}>
              <input type="hidden" name="csrf" value={csrfToken} />
              <Button className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B] transition hover:bg-[rgba(227,91,91,0.2)]">
                <LogOut className="mr-2 size-4" />
                Log out other devices
              </Button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
