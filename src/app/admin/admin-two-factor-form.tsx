"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { TwoFactorLoginState } from "@/app/admin/actions";
import { verifyTwoFactorLogin } from "@/app/admin/actions";

type Props = Record<string, never>;

const initialState: TwoFactorLoginState = { ok: false };

export const AdminTwoFactorForm = (_props: Props): React.JSX.Element => {
  const [state, formAction, pending] = useActionState(verifyTwoFactorLogin, initialState);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const code = useMemo(() => digits.join(""), [digits]);

  const setAt = (idx: number, value: string): void => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev];
        next[idx] = "";
        return next;
      });
      return;
    }

    if (cleaned.length > 1) {
      const arr = cleaned.slice(0, 6).split("");
      setDigits([arr[0] ?? "", arr[1] ?? "", arr[2] ?? "", arr[3] ?? "", arr[4] ?? "", arr[5] ?? ""]);
      refs.current[Math.min(arr.length, 5)]?.focus();
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      next[idx] = cleaned;
      return next;
    });
    if (idx < 5) refs.current[idx + 1]?.focus();
  };

  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const arr = pasted.split("");
    setDigits([arr[0] ?? "", arr[1] ?? "", arr[2] ?? "", arr[3] ?? "", arr[4] ?? "", arr[5] ?? ""]);
    refs.current[Math.min(arr.length, 5)]?.focus();
  };

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

        <input type="hidden" name="code" value={code} />

        <div className="flex gap-2">
          {digits.map((value, idx) => (
            <input
              key={`otp-${idx}`}
              ref={(el) => {
                refs.current[idx] = el;
              }}
              inputMode="numeric"
              maxLength={1}
              value={value}
              aria-label={`Digit ${idx + 1}`}
              onChange={(event) => setAt(idx, event.target.value)}
              onPaste={onPaste}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !digits[idx] && idx > 0) refs.current[idx - 1]?.focus();
              }}
              className="h-12 flex-1 rounded-[7px] border border-line bg-transparent text-center font-mono text-[18px] text-fg outline-none focus:border-accent"
            />
          ))}
        </div>

        {state.error ? <p className="m-0 text-[12px] text-danger">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
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
