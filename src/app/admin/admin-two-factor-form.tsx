"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <form action={formAction} className="w-full max-w-md space-y-4 border border-white/20 bg-black/80 p-6">
      <h1 className="font-inria text-2xl">Two-Factor Verification</h1>
      <p className="font-inria text-sm text-white/70">Enter the 6-digit code from your authenticator app.</p>
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
            onChange={(event) => setAt(idx, event.target.value)}
            onPaste={onPaste}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digits[idx] && idx > 0) refs.current[idx - 1]?.focus();
            }}
            className="h-12 w-12 border border-white/20 bg-black text-center font-inria text-xl text-white outline-none focus:border-[#5BE38B]"
          />
        ))}
      </div>

      {state.error ? <p className="font-inria text-sm text-[#E35B5B]">{state.error}</p> : null}

      <Button className="w-full" disabled={pending}>
        {pending ? "Verifying..." : "Verify and continue"}
      </Button>

      <Link href="/admin" className="block text-center font-inria text-sm text-white/70 underline">
        Back to login
      </Link>
    </form>
  );
};
