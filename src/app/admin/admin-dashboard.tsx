"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Menu, PanelLeftClose, ShieldCheck, FileText, Settings, Eye, EyeOff, Monitor, Smartphone, KeyRound, LogOut, ImageIcon, LayoutDashboard, Globe, FolderOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PasswordState, TwoFactorState } from "@/app/admin/actions";
import { changePassword, confirmTwoFactorSetup, deletePasskey, deleteProject, disableTwoFactor, logoutAdmin, revokeSession, startTwoFactorSetup, toggleProjectVisibility } from "@/app/admin/actions";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  subtitle: string;
  visible: boolean;
  imageUrl: string | null;
};

type SessionItem = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  revokedAt: Date | null;
};

type Props = {
  csrfToken: string;
  projects: ProjectItem[];
  sessions: SessionItem[];
  passkeys: Array<{ id: string; createdAt: Date; lastUsedAt: Date | null; deviceType: string }>;
  twoFactorEnabled: boolean;
  initialTab: "overview" | "case-studies" | "settings";
  saved: boolean;
  errorMessage?: string;
};

const passwordInit: PasswordState = { ok: false };
const twoFactorInit: TwoFactorState = { ok: false };

export const AdminDashboard = ({ csrfToken, projects, sessions, passkeys, twoFactorEnabled, initialTab, saved, errorMessage }: Props): React.JSX.Element => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<"overview" | "case-studies" | "settings">(initialTab);
  const [pwState, pwAction, pwPending] = useActionState(changePassword, passwordInit);
  const [twoFactorState, twoFactorSetupAction, twoFactorSetupPending] = useActionState(startTwoFactorSetup, twoFactorInit);
  const [twoFactorConfirmState, twoFactorConfirmAction, twoFactorConfirmPending] = useActionState(confirmTwoFactorSetup, twoFactorInit);
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const visibleProjects = projects.filter((project) => project.visible).length;
  const hiddenProjects = projects.length - visibleProjects;
  const withImage = projects.filter((project) => Boolean(project.imageUrl)).length;

  const registerPasskey = async (): Promise<void> => {
    setPasskeyPending(true);
    setPasskeyError(null);
    try {
      const optionsResponse = await fetch("/api/admin/passkeys/register/options", { method: "POST" });
      if (!optionsResponse.ok) {
        const payload = (await optionsResponse.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to start passkey registration.");
      }
      const options = (await optionsResponse.json()) as Parameters<typeof startRegistration>[0];
      const registrationResponse = await startRegistration(options);
      const verifyResponse = await fetch("/api/admin/passkeys/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: registrationResponse })
      });
      if (!verifyResponse.ok) {
        const payload = (await verifyResponse.json()) as { error?: string };
        throw new Error(payload.error ?? "Passkey verification failed.");
      }
      window.location.reload();
    } catch (error) {
      setPasskeyError(error instanceof Error ? error.message : "Passkey registration failed.");
    } finally {
      setPasskeyPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-[2300px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 bg-[#050505] p-6 md:block">
          <nav className="space-y-2">
            <button onClick={() => setTab("overview")} className={`flex w-full items-center gap-3 border px-4 py-3 text-left ${tab === "overview" ? "border-[#5BE38B] bg-[rgba(91,227,139,0.12)] text-[#5BE38B]" : "border-white/15"}`}>
              <LayoutDashboard className="size-4" /> Overview
            </button>
            <button onClick={() => setTab("case-studies")} className={`flex w-full items-center gap-3 border px-4 py-3 text-left ${tab === "case-studies" ? "border-[#5BE38B] bg-[rgba(91,227,139,0.12)] text-[#5BE38B]" : "border-white/15"}`}>
              <FileText className="size-4" /> Case Studies
            </button>
            <button onClick={() => setTab("settings")} className={`flex w-full items-center gap-3 border px-4 py-3 text-left ${tab === "settings" ? "border-[#5BE38B] bg-[rgba(91,227,139,0.12)] text-[#5BE38B]" : "border-white/15"}`}>
              <Settings className="size-4" /> Settings
            </button>
          </nav>
        </aside>

        <section className="p-5 md:p-8 xl:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileOpen(true)} className="inline-flex border border-white/20 p-2 md:hidden"><Menu className="size-5" /></button>
              <h1 className="font-inria text-2xl md:text-3xl">Admin Dashboard</h1>
            </div>
            <form action={logoutAdmin}><Button variant="ghost" className="border border-white/15"><LogOut className="mr-2 size-4" />Logout</Button></form>
          </div>

          {saved ? <div className="mb-4 border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] px-4 py-3 text-sm text-[#5BE38B]">Case study saved successfully.</div> : null}
          {errorMessage ? <div className="mb-4 border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] px-4 py-3 text-sm text-[#E35B5B]">{errorMessage}</div> : null}

          {mobileOpen ? (
            <div className="mb-6 border border-white/15 bg-[#070707] p-3 md:hidden">
              <button onClick={() => setMobileOpen(false)} className="mb-2 inline-flex border border-white/20 p-2"><PanelLeftClose className="size-4" /></button>
              <div className="space-y-2">
                <button onClick={() => { setTab("overview"); setMobileOpen(false); }} className="flex w-full items-center gap-2 border border-white/20 p-3 text-left"><LayoutDashboard className="size-4" />Overview</button>
                <button onClick={() => { setTab("case-studies"); setMobileOpen(false); }} className="flex w-full items-center gap-2 border border-white/20 p-3 text-left"><FileText className="size-4" />Case Studies</button>
                <button onClick={() => { setTab("settings"); setMobileOpen(false); }} className="flex w-full items-center gap-2 border border-white/20 p-3 text-left"><Settings className="size-4" />Settings</button>
              </div>
            </div>
          ) : null}

          {tab === "overview" ? (
            <div className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-4">
                <article className="border border-white/15 bg-[#070707] p-4">
                  <p className="font-inria text-xs uppercase text-white/60">Total Projects</p>
                  <p className="mt-2 font-inria text-4xl">{projects.length}</p>
                </article>
                <article className="border border-[#5BE38B]/40 bg-[rgba(91,227,139,0.08)] p-4">
                  <p className="font-inria text-xs uppercase text-white/70">Visible</p>
                  <p className="mt-2 font-inria text-4xl text-[#5BE38B]">{visibleProjects}</p>
                </article>
                <article className="border border-[#E35B5B]/40 bg-[rgba(227,91,91,0.08)] p-4">
                  <p className="font-inria text-xs uppercase text-white/70">Hidden</p>
                  <p className="mt-2 font-inria text-4xl text-[#E35B5B]">{hiddenProjects}</p>
                </article>
                <article className="border border-[#5B76E3]/40 bg-[rgba(91,118,227,0.08)] p-4">
                  <p className="font-inria text-xs uppercase text-white/70">With Title Image</p>
                  <p className="mt-2 font-inria text-4xl text-[#5B76E3]">{withImage}</p>
                </article>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <section className="border border-white/15 bg-[#070707] p-5">
                  <h2 className="flex items-center gap-2 font-inria text-xl"><FolderOpen className="size-5" /> Recent Case Studies</h2>
                  <div className="mt-4 space-y-2">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between border border-white/10 p-3">
                        <div>
                          <p className="font-inria">{project.title}</p>
                          <p className="text-xs text-white/60">{project.slug}</p>
                        </div>
                        <Link href={`/admin/projects/${project.id}`} className="text-sm text-[#5BE38B] underline">Edit</Link>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border border-white/15 bg-[#070707] p-5">
                  <h2 className="flex items-center gap-2 font-inria text-xl"><Globe className="size-5" /> Title Image Strategy</h2>
                  <p className="mt-3 text-sm text-white/75">
                    Best practice: upload images to object storage (S3/R2/Cloudflare Images) and save only the URL in PostgreSQL.
                  </p>
                  <p className="mt-3 text-sm text-white/75">
                    PostgreSQL can store images as <span className="text-[#5BE38B]">BYTEA</span>, but this is usually slower and more expensive for a portfolio workflow.
                  </p>
                  <p className="mt-3 text-sm text-white/75">
                    Current workflow: open a case study via <span className="text-[#5BE38B]">Edit</span> and paste the image URL into <span className="text-[#5BE38B]">Title image URL</span>.
                  </p>
                </section>
              </div>
            </div>
          ) : tab === "case-studies" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border border-white/15 bg-[#070707] p-4">
                <div>
                  <h2 className="font-inria text-xl">Case Studies</h2>
                  <p className="text-sm text-white/65">Create and manage your projects.</p>
                </div>
                <Link href="/admin/projects/new">
                  <Button className="border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B] transition hover:bg-[rgba(91,227,139,0.2)]">
                    + Add Case Study
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
              {projects.map((project) => (
                <article key={project.id} className="border border-white/15 bg-[#070707] p-4 md:p-5">
                  <div className="grid gap-4">
                    <div className="relative aspect-[1200/630] w-full overflow-hidden border border-white/10 bg-[#151618]">
                      {project.imageUrl ? (
                        <Image src={project.imageUrl} alt={`${project.title} title image`} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 40vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/45"><ImageIcon className="mr-2 size-4" />No title image</div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-inria text-xl md:text-2xl">{project.title}</h2>
                      <p className="mt-2 line-clamp-3 font-instrument text-lg text-white/80 md:text-xl">{project.description}</p>
                      <p className="mt-2 text-sm text-[#5BE38B]">Slug: {project.slug}</p>
                      <p className="mt-1 text-xs text-white/55">Title image is editable in <span className="text-[#5BE38B]">Edit → Title image URL</span>.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={toggleProjectVisibility}>
                        <input type="hidden" name="csrf" value={csrfToken} />
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="visible" value={project.visible ? "false" : "true"} />
                        <Button className={project.visible ? "border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B] transition hover:bg-[rgba(91,227,139,0.2)]" : "border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B] transition hover:bg-[rgba(227,91,91,0.2)]"}>
                          {project.visible ? <Eye className="mr-2 size-4" /> : <EyeOff className="mr-2 size-4" />}
                          {project.visible ? "Visible" : "Hidden"}
                        </Button>
                      </form>
                      <Link href={`/admin/projects/${project.id}`}><Button className="border border-white/25 transition hover:border-[#5BE38B] hover:text-[#5BE38B]">Edit Case Study</Button></Link>
                      <form action={deleteProject}>
                        <input type="hidden" name="csrf" value={csrfToken} />
                        <input type="hidden" name="id" value={project.id} />
                        <Button className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B] transition hover:bg-[rgba(227,91,91,0.2)]">Delete</Button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="border border-white/15 bg-[#070707] p-4 md:p-5">
                <h2 className="font-inria text-xl md:text-2xl">Security</h2>
                <p className="mt-1 text-sm text-white/70">Passkeys and 2FA controls.</p>
                <div className="mt-4 space-y-4">
                  <div className="border border-white/10 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-inria text-lg">Passkeys</h3>
                      <Button type="button" onClick={registerPasskey} disabled={passkeyPending} className="justify-start border border-white/20 bg-transparent">
                        <KeyRound className="mr-2 size-4" />
                        {passkeyPending ? "Registering..." : "Register Passkey"}
                      </Button>
                    </div>
                    {passkeyError ? <p className="mb-3 text-sm text-[#E35B5B]">{passkeyError}</p> : null}
                    <div className="space-y-2">
                      {passkeys.length === 0 ? (
                        <p className="text-sm text-white/65">No passkeys registered yet.</p>
                      ) : (
                        passkeys.map((passkey) => (
                          <form key={passkey.id} action={deletePasskey} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 p-3">
                            <input type="hidden" name="csrf" value={csrfToken} />
                            <input type="hidden" name="authenticatorId" value={passkey.id} />
                            <div className="text-sm">
                              <p>{passkey.deviceType}</p>
                              <p className="text-white/65">Created: {new Date(passkey.createdAt).toLocaleString("de-DE")}</p>
                              <p className="text-white/65">Last used: {passkey.lastUsedAt ? new Date(passkey.lastUsedAt).toLocaleString("de-DE") : "Never"}</p>
                            </div>
                            <Button className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B]">Delete</Button>
                          </form>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="border border-white/10 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-inria text-lg">Two-Factor Auth (TOTP)</h3>
                      {twoFactorEnabled ? (
                        <form action={disableTwoFactor}>
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <Button className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B]">
                            <ShieldCheck className="mr-2 size-4" />
                            Disable 2FA
                          </Button>
                        </form>
                      ) : (
                        <form action={twoFactorSetupAction}>
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <Button disabled={twoFactorSetupPending} className="justify-start border border-white/20 bg-transparent">
                            <ShieldCheck className="mr-2 size-4" />
                            {twoFactorSetupPending ? "Preparing..." : "Setup 2FA"}
                          </Button>
                        </form>
                      )}
                    </div>

                    {twoFactorEnabled ? <p className="text-sm text-[#5BE38B]">2FA is currently enabled.</p> : null}
                    {twoFactorState.error ? <p className="text-sm text-[#E35B5B]">{twoFactorState.error}</p> : null}
                    {twoFactorState.message ? <p className="text-sm text-[#5BE38B]">{twoFactorState.message}</p> : null}

                    {twoFactorState.qrDataUrl ? (
                      <div className="mt-3 space-y-3">
                        <Image src={twoFactorState.qrDataUrl} alt="2FA QR Code" width={180} height={180} className="border border-white/15 bg-white p-2" unoptimized />
                        <p className="break-all text-xs text-white/70">Secret: {twoFactorState.secret}</p>
                        <form action={twoFactorConfirmAction} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <input name="code" placeholder="123456" inputMode="numeric" className="border border-white/20 bg-black px-3 py-2" />
                          <Button disabled={twoFactorConfirmPending} className="border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B]">
                            {twoFactorConfirmPending ? "Verifying..." : "Enable 2FA"}
                          </Button>
                        </form>
                        {twoFactorConfirmState.error ? <p className="text-sm text-[#E35B5B]">{twoFactorConfirmState.error}</p> : null}
                        {twoFactorConfirmState.message ? <p className="text-sm text-[#5BE38B]">{twoFactorConfirmState.message}</p> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="border border-white/15 bg-[#070707] p-4 md:p-5">
                <h2 className="font-inria text-xl md:text-2xl">Change Password</h2>
                <form action={pwAction} className="mt-4 grid gap-3 md:max-w-xl">
                  <input type="hidden" name="csrf" value={csrfToken} />
                  <input name="currentPassword" type="password" required placeholder="Current password" className="border border-white/20 bg-black px-3 py-2" />
                  <input name="newPassword" type="password" required placeholder="New password" className="border border-white/20 bg-black px-3 py-2" />
                  <input name="confirmPassword" type="password" required placeholder="Confirm new password" className="border border-white/20 bg-black px-3 py-2" />
                  {pwState.error ? <p className="text-sm text-[#E35B5B]">{pwState.error}</p> : null}
                  {pwState.message ? <p className="text-sm text-[#5BE38B]">{pwState.message}</p> : null}
                  <Button disabled={pwPending} className="justify-self-start border border-[#5BE38B] bg-[rgba(91,227,139,0.1)] text-[#5BE38B]">{pwPending ? "Saving..." : "Update password"}</Button>
                </form>
              </section>

              <section className="border border-white/15 bg-[#070707] p-4 md:p-5">
                <h2 className="font-inria text-xl md:text-2xl">Sessions</h2>
                <div className="mt-4 space-y-2">
                  {sessions.map((session) => (
                    <form key={session.id} action={revokeSession} className="flex flex-col justify-between gap-3 border border-white/15 p-3 md:flex-row md:items-center">
                      <input type="hidden" name="csrf" value={csrfToken} />
                      <input type="hidden" name="sessionId" value={session.id} />
                      <div className="text-sm">
                        <p className="flex items-center gap-2"><Monitor className="size-4" />{session.userAgent ?? "Unknown device"}</p>
                        <p className="mt-1 flex items-center gap-2 text-white/65"><Smartphone className="size-4" />{session.ipAddress ?? "Unknown IP"}</p>
                      </div>
                      <Button className="border border-[#E35B5B] bg-[rgba(227,91,91,0.1)] text-[#E35B5B]">Revoke</Button>
                    </form>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
