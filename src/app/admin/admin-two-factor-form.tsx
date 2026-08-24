"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { TwoFactorLoginState } from "@/app/admin/actions";
import { verifyTwoFactorLogin } from "@/app/admin/actions";

type Props = Record<string, never>;

const initialState: TwoFactorLoginState = { ok: false };

export const AdminTwoFactorForm = (_props: Props): React.JSX.Element => {
  const [state, formAction, pending] = useActionState(verifyTwoFactorLogin, initialState);
  const [code, setCode] = useState("");

  return (
    <form
      action={formAction}
      className="w-full max-w-[380px] overflow-hidden rounded-[10px] border border-line-strong bg-surface"
    >
      <div className="flex items-center gap-3 border-b border-line px-6 py-4">
        <Image src="/jg_logo.png" alt="" width={18} height={18} className="size-[18px]" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">Admin / Verify</span>
      </div>

      <div className="flex flex-col gap-4 px-6 py-[26px]">
        <div>
          <h1 className="m-0 text-[22px] font-light leading-[1.25] tracking-[-0.02em]">Two-factor verification</h1>
          <p className="m-0 mt-2 text-[13px] leading-[1.6] text-fg-muted">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        {/* One field rather than six boxes: it pastes cleanly, autofills from the
            OS one-time-code hint, and never leaves focus stranded mid-code. */}
        <input
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="000000"
          aria-label="Six-digit authentication code"
          className="rounded-[7px] border border-line bg-transparent px-3.5 py-3 text-center font-mono text-[22px] tracking-[0.4em] text-fg outline-none placeholder:text-fg-faint placeholder:tracking-[0.4em] focus:border-accent"
        />

        {state.error ? <p className="m-0 text-[12px] text-danger">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending || code.length < 6}
          className="rounded-md bg-accent px-3.5 py-2.5 text-[12px] font-medium text-accent-fg transition-opacity disabled:opacity-50"
        >
          {pending ? "Verifying…" : "Verify and continue"}
        </button>

        <Link href="/admin" className="text-center text-[12px] text-fg-muted transition-colors hover:text-fg">
          Back to sign in
        </Link>
      </div>
    </form>
  );
};
