"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoginState } from "@/app/admin/actions";
import { loginAdmin } from "@/app/admin/actions";

type Props = { csrfToken: string };

const initialState: LoginState = { ok: false };

export const AdminLoginForm = ({ csrfToken }: Props): React.JSX.Element => {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  const [passkeyPending, setPasskeyPending] = useState(false);
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
      const next = Math.min(arr.length, 5);
      refs.current[next]?.focus();
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

  const signInWithPasskey = async (): Promise<void> => {
    setPasskeyPending(true);
    try {
      const optionsResponse = await fetch("/api/admin/passkeys/login/options", { method: "POST" });
      if (!optionsResponse.ok) {
        const payload = (await optionsResponse.json()) as { error?: string };
        throw new Error(payload.error ?? "Could not start passkey login.");
      }
      const options = (await optionsResponse.json()) as Parameters<typeof startAuthentication>[0];
      const authResponse = await startAuthentication(options);
      const verifyResponse = await fetch("/api/admin/passkeys/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: authResponse })
      });
      if (!verifyResponse.ok) {
        const payload = (await verifyResponse.json()) as { error?: string };
        throw new Error(payload.error ?? "Passkey login failed.");
      }
      window.location.href = "/admin";
    } catch (error) {
      console.error(error);
    } finally {
      setPasskeyPending(false);
    }
  };

  return (
    <form action={formAction} className="w-full max-w-md space-y-4 border border-white/20 bg-black/80 p-6">
      <h1 className="font-inria text-2xl">Admin Login</h1>
      <input type="hidden" name="csrf" value={csrfToken} />
      <input type="hidden" name="twoFactorCode" value={code} />

      <Input name="email" type="email" required placeholder="me@juliusgrimm.dev" />
      <Input name="password" type="password" required placeholder="••••••••••••" />

      <div className="space-y-2">
        <p className="font-inria text-xs uppercase text-white/70">Authenticator Code (if enabled)</p>
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
      </div>

      {state.error ? <p className="font-inria text-sm text-[#E35B5B]">{state.error}</p> : null}

      <Button className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>

      <Button type="button" variant="ghost" className="w-full border border-white/20 text-white" onClick={signInWithPasskey} disabled={passkeyPending}>
        <KeyRound className="mr-2 size-4" />
        {passkeyPending ? "Signing in..." : "Sign in with Passkey"}
      </Button>
    </form>
  );
};
