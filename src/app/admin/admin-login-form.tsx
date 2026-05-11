"use client";

import { useActionState, useState } from "react";
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

      <Input name="email" type="email" required placeholder="me@juliusgrimm.dev" />
      <Input name="password" type="password" required placeholder="••••••••••••" />

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
