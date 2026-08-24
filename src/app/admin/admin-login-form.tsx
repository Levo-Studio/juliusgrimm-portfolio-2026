"use client";

import { useActionState, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { KeyRound } from "lucide-react";
import Image from "next/image";
import type { LoginState } from "@/app/admin/actions";
import { loginAdmin } from "@/app/admin/actions";

type Props = Record<string, never>;

const initialState: LoginState = { ok: false };

export const AdminLoginForm = (_props: Props): React.JSX.Element => {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);
  const [passkeyPending, setPasskeyPending] = useState(false);

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
    <form
      action={formAction}
      className="w-full max-w-[380px] overflow-hidden rounded-[10px] border border-line-strong bg-surface"
    >
      <div className="flex items-center gap-3 border-b border-line px-6 py-4">
        <Image src="/jg_logo.png" alt="" width={18} height={18} className="size-[18px]" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">Admin / Sign in</span>
      </div>

      <div className="flex flex-col gap-4 px-6 py-[26px]">
        <div className="flex flex-col gap-2">
          <label htmlFor="login-email" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="me@juliusgrimm.dev"
            className="rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="login-password" className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-muted">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="rounded-[7px] border border-line bg-transparent px-3 py-2.5 text-[14px] text-fg-field outline-none placeholder:text-fg-faint focus:border-accent"
          />
        </div>

        {state.error ? <p className="m-0 text-[12px] text-danger">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-md bg-accent px-3.5 py-2.5 text-[12px] font-medium text-accent-fg transition-opacity disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-fg-faint">OR</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={signInWithPasskey}
          disabled={passkeyPending}
          className="flex items-center justify-center gap-2 rounded-md border border-line-strong px-3.5 py-2.5 text-[12px] text-fg-muted transition-colors hover:border-line-field hover:text-fg disabled:opacity-50"
        >
          <KeyRound className="size-3.5" />
          {passkeyPending ? "Signing in…" : "Sign in with passkey"}
        </button>
      </div>
    </form>
  );
};
