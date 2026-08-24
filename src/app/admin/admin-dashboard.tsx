"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import gsap from "gsap";
import { startRegistration } from "@simplewebauthn/browser";
import { Menu, PanelLeftClose, ShieldCheck, FileText, Settings, Monitor, Smartphone, KeyRound, LogOut, LayoutDashboard, FolderOpen, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PasswordState, TwoFactorState } from "@/app/admin/actions";
import { changePassword, confirmTwoFactorSetup, deletePasskey, disableTwoFactor, logoutAdmin, revokeSession, saveSurvivalKitTags, startTwoFactorSetup, toggleProjectVisibility } from "@/app/admin/actions";
import { SurvivalKitTagEditor } from "@/app/admin/survival-kit-tag-editor";
import { AdminReveal } from "@/app/admin/admin-reveal";
import { DeleteProjectDialog } from "@/app/admin/projects/delete-project-dialog";
import { LogoutOtherDevicesDialog } from "@/app/admin/logout-other-devices-dialog";
import type { ColorCategory } from "@/types/project";

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

type SurvivalTagItem = {
  label: string;
  color: ColorCategory;
};

type AdminTab = "overview" | "case-studies" | "survival-kit" | "settings";

type Props = {
  csrfToken: string;
  projects: ProjectItem[];
  survivalTags: SurvivalTagItem[];
  sessions: SessionItem[];
  passkeys: Array<{ id: string; createdAt: Date; lastUsedAt: Date | null; deviceType: string }>;
  twoFactorEnabled: boolean;
  initialTab: AdminTab;
  saved: boolean;
  errorMessage?: string;
};

const passwordInit: PasswordState = { ok: false };
const twoFactorInit: TwoFactorState = { ok: false };

export const AdminDashboard = ({ csrfToken, projects, survivalTags, sessions, passkeys, twoFactorEnabled, initialTab, saved, errorMessage }: Props): React.JSX.Element => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [pwState, pwAction, pwPending] = useActionState(changePassword, passwordInit);
  const [twoFactorState, twoFactorSetupAction, twoFactorSetupPending] = useActionState(startTwoFactorSetup, twoFactorInit);
  const [twoFactorConfirmState, twoFactorConfirmAction, twoFactorConfirmPending] = useActionState(confirmTwoFactorSetup, twoFactorInit);
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const visibleProjects = projects.filter((project) => project.visible).length;
  const hiddenProjects = projects.length - visibleProjects;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.from("[data-admin-header]", { opacity: 0, y: reduce ? 0 : -12, duration: reduce ? 0.2 : 0.5, ease: "power2.out", clearProps: "opacity,transform" });
      gsap.from("[data-admin-nav] > button", {
        opacity: 0,
        x: reduce ? 0 : -14,
        duration: reduce ? 0.2 : 0.45,
        stagger: reduce ? 0.02 : 0.06,
        ease: "power2.out",
        delay: 0.04,
        clearProps: "opacity,transform"
      });
    });
    return () => ctx.revert();
  }, []);

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
    <main className="min-h-screen bg-bg text-fg">
      <div className="mx-auto grid min-h-screen w-full max-w-[2300px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="hidden border-r border-line bg-bg p-6 md:block md:sticky md:top-0 md:h-screen md:self-start md:overflow-y-auto">
          <nav data-admin-nav className="space-y-2">
            <button onClick={() => setTab("overview")} className={`flex w-full items-center gap-3 border px-4 py-3 text-left ${tab === "overview" ? "border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent" : "border-line-strong"}`}>
              <LayoutDashboard className="size-4" /> Overview
            </button>
            <button onClick={() => setTab("case-studies")} className={`flex w-full items-center gap-3 border px-4 py-3 text-left ${tab === "case-studies" ? "border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent" : "border-line-strong"}`}>
              <FileText className="size-4" /> Case Studies
            </button>
            <button onClick={() => setTab("survival-kit")} className={`flex w-full items-center gap-3 border px-4 py-3 text-left ${tab === "survival-kit" ? "border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent" : "border-line-strong"}`}>
              <Tags className="size-4" /> Survival Kit
            </button>
            <button onClick={() => setTab("settings")} className={`flex w-full items-center gap-3 border px-4 py-3 text-left ${tab === "settings" ? "border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent" : "border-line-strong"}`}>
              <Settings className="size-4" /> Settings
            </button>
          </nav>
        </aside>

        <section className="p-5 md:p-8 xl:p-10">
          <div data-admin-header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileOpen(true)} className="inline-flex border border-line-strong p-2 md:hidden"><Menu className="size-5" /></button>
              <h1 className="text-2xl md:text-3xl">Admin Dashboard</h1>
            </div>
            <form action={logoutAdmin}><Button variant="ghost" className="border border-line-strong"><LogOut className="mr-2 size-4" />Logout</Button></form>
          </div>

          {saved ? <div className="mb-4 border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-3 text-sm text-accent">Saved successfully.</div> : null}
          {errorMessage ? <div className="mb-4 border border-danger bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-3 text-sm text-danger">{errorMessage}</div> : null}

          {mobileOpen ? (
            <div className="mb-6 border border-line-strong bg-surface p-3 md:hidden">
              <button onClick={() => setMobileOpen(false)} className="mb-2 inline-flex border border-line-strong p-2"><PanelLeftClose className="size-4" /></button>
              <div className="space-y-2">
                <button onClick={() => { setTab("overview"); setMobileOpen(false); }} className="flex w-full items-center gap-2 border border-line-strong p-3 text-left"><LayoutDashboard className="size-4" />Overview</button>
                <button onClick={() => { setTab("case-studies"); setMobileOpen(false); }} className="flex w-full items-center gap-2 border border-line-strong p-3 text-left"><FileText className="size-4" />Case Studies</button>
                <button onClick={() => { setTab("survival-kit"); setMobileOpen(false); }} className="flex w-full items-center gap-2 border border-line-strong p-3 text-left"><Tags className="size-4" />Survival Kit</button>
                <button onClick={() => { setTab("settings"); setMobileOpen(false); }} className="flex w-full items-center gap-2 border border-line-strong p-3 text-left"><Settings className="size-4" />Settings</button>
              </div>
            </div>
          ) : null}

          <AdminReveal key={tab}>
          {tab === "overview" ? (
            <div className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-4">
                <article className="border border-line-strong bg-surface p-4">
                  <p className="text-xs uppercase text-fg-muted">Total Projects</p>
                  <p className="mt-2 text-4xl">{projects.length}</p>
                </article>
                <article className="border border-accent/40 bg-[rgba(91,227,139,0.08)] p-4">
                  <p className="text-xs uppercase text-fg-muted">Visible</p>
                  <p className="mt-2 text-4xl text-accent">{visibleProjects}</p>
                </article>
                <article className="border border-danger/40 bg-[rgba(227,91,91,0.08)] p-4">
                  <p className="text-xs uppercase text-fg-muted">Hidden</p>
                  <p className="mt-2 text-4xl text-danger">{hiddenProjects}</p>
                </article>
              </div>

              <div className="grid gap-4">
                <section className="border border-line-strong bg-surface p-5">
                  <h2 className="flex items-center gap-2 text-xl"><FolderOpen className="size-5" /> Recent Case Studies</h2>
                  <div className="mt-4 space-y-2">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between border border-line p-3">
                        <div>
                          <p className="">{project.title}</p>
                          <p className="text-xs text-fg-muted">{project.slug}</p>
                        </div>
                        <Link href={`/admin/projects/${project.id}`} className="text-sm text-accent underline">Edit</Link>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </div>
          ) : tab === "case-studies" ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">
                  Admin / Case studies
                </p>
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/admin/projects/new?mode=ai"
                    className="rounded-md border border-line-strong px-3 py-[7px] text-[12px] text-fg-muted transition-colors hover:border-line-field hover:text-fg"
                  >
                    Generate with AI
                  </Link>
                  <Link
                    href="/admin/projects/new"
                    className="rounded-md bg-accent px-[13px] py-2 text-[12px] font-medium text-accent-fg"
                  >
                    New case study
                  </Link>
                </div>
              </div>

              {/* Published and draft are the two states that matter here, so they are
                  counted up front rather than left to be read off the rows. */}
              <div className="flex gap-5 text-[12px] text-fg-muted">
                <span className="text-fg">
                  All <span className="text-fg-faint">{projects.length}</span>
                </span>
                <span>
                  Published <span className="text-fg-faint">{visibleProjects}</span>
                </span>
                <span>
                  Drafts <span className="text-fg-faint">{hiddenProjects}</span>
                </span>
              </div>

              <div className="flex flex-col border-t border-line">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="row-link grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 border-b border-line px-3 py-3.5 md:grid-cols-[18px_200px_minmax(0,1fr)_auto_auto] md:items-center md:gap-5"
                  >
                    <span
                      aria-hidden
                      className="grid size-[18px] shrink-0 place-items-center rounded-[4px] bg-accent font-mono text-[9px] font-medium text-accent-fg"
                    >
                      {project.title.trim().charAt(0).toUpperCase()}
                    </span>

                    <span className="truncate text-[14px]">{project.title}</span>

                    <span className="col-start-2 truncate text-[12px] text-fg-muted md:col-start-auto">
                      {project.subtitle || project.description}
                    </span>

                    <span className="col-start-2 md:col-start-auto">
                      {project.visible ? (
                        <span className="whitespace-nowrap font-mono text-[10px] font-medium tracking-[0.1em] text-accent">● PUBLISHED</span>
                      ) : (
                        <span className="whitespace-nowrap font-mono text-[10px] font-medium tracking-[0.1em] text-draft">◌ DRAFT</span>
                      )}
                    </span>

                    <span className="col-start-2 flex items-center gap-3 whitespace-nowrap text-[11px] text-fg-muted md:col-start-auto md:justify-end">
                      <Link href={`/admin/projects/${project.id}`} className="transition-colors hover:text-fg">
                        Edit
                      </Link>
                      {/* Publishing toggles in place; the row is the control, so there is
                          no separate visibility screen to walk to. */}
                      <form action={toggleProjectVisibility}>
                        <input type="hidden" name="csrf" value={csrfToken} />
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="visible" value={project.visible ? "false" : "true"} />
                        <button type="submit" className="transition-colors hover:text-fg">
                          {project.visible ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <DeleteProjectDialog csrfToken={csrfToken} projectId={project.id} projectTitle={project.title} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === "survival-kit" ? (
            <div className="space-y-4">
              <section className="border border-line-strong bg-surface p-4 md:p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl md:text-2xl"><Tags className="size-5" /> Survival Kit Tags</h2>
                    <p className="mt-1 text-sm text-fg-muted">Manage the tags shown in the TECH STACK section.</p>
                  </div>
                  <Link href="/#tech-stack" className="text-sm text-accent underline">View homepage</Link>
                </div>
                <form action={saveSurvivalKitTags} className="space-y-5">
                  <input type="hidden" name="csrf" value={csrfToken} />
                  <SurvivalKitTagEditor initialTags={survivalTags.map((tag, index) => ({ ...tag, sortOrder: index + 1 }))} />
                  <Button className="border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent transition hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]">
                    Save tags
                  </Button>
                </form>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="border border-line-strong bg-surface p-4 md:p-5">
                <h2 className="text-xl md:text-2xl">Security</h2>
                <p className="mt-1 text-sm text-fg-muted">Passkeys and 2FA controls.</p>
                <div className="mt-4 space-y-4">
                  <div className="border border-line p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg">Passkeys</h3>
                      <Button type="button" onClick={registerPasskey} disabled={passkeyPending} className="justify-start border border-line-strong bg-transparent">
                        <KeyRound className="mr-2 size-4" />
                        {passkeyPending ? "Registering..." : "Register Passkey"}
                      </Button>
                    </div>
                    {passkeyError ? <p className="mb-3 text-sm text-danger">{passkeyError}</p> : null}
                    <div className="space-y-2">
                      {passkeys.length === 0 ? (
                        <p className="text-sm text-fg-muted">No passkeys registered yet.</p>
                      ) : (
                        passkeys.map((passkey) => (
                          <form key={passkey.id} action={deletePasskey} className="flex flex-wrap items-center justify-between gap-3 border border-line p-3">
                            <input type="hidden" name="csrf" value={csrfToken} />
                            <input type="hidden" name="authenticatorId" value={passkey.id} />
                            <div className="text-sm">
                              <p>{passkey.deviceType}</p>
                              <p className="text-fg-muted">Created: {new Date(passkey.createdAt).toLocaleString("de-DE")}</p>
                              <p className="text-fg-muted">Last used: {passkey.lastUsedAt ? new Date(passkey.lastUsedAt).toLocaleString("de-DE") : "Never"}</p>
                            </div>
                            <Button className="border border-danger bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger">Delete</Button>
                          </form>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="border border-line p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg">Two-Factor Auth (TOTP)</h3>
                      {twoFactorEnabled ? (
                        <form action={disableTwoFactor}>
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <Button className="border border-danger bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger">
                            <ShieldCheck className="mr-2 size-4" />
                            Disable 2FA
                          </Button>
                        </form>
                      ) : (
                        <form action={twoFactorSetupAction}>
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <Button disabled={twoFactorSetupPending} className="justify-start border border-line-strong bg-transparent">
                            <ShieldCheck className="mr-2 size-4" />
                            {twoFactorSetupPending ? "Preparing..." : "Setup 2FA"}
                          </Button>
                        </form>
                      )}
                    </div>

                    {twoFactorEnabled ? <p className="text-sm text-accent">2FA is currently enabled.</p> : null}
                    {twoFactorState.error ? <p className="text-sm text-danger">{twoFactorState.error}</p> : null}
                    {twoFactorState.message ? <p className="text-sm text-accent">{twoFactorState.message}</p> : null}

                    {twoFactorState.qrDataUrl ? (
                      <div className="mt-3 space-y-3">
                        <Image src={twoFactorState.qrDataUrl} alt="2FA QR Code" width={180} height={180} className="border border-line-strong bg-white p-2" unoptimized />
                        <p className="break-all text-xs text-fg-muted">Secret: {twoFactorState.secret}</p>
                        <form action={twoFactorConfirmAction} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <input name="code" placeholder="123456" inputMode="numeric" className="border border-line-strong bg-bg px-3 py-2" />
                          <Button disabled={twoFactorConfirmPending} className="border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent">
                            {twoFactorConfirmPending ? "Verifying..." : "Enable 2FA"}
                          </Button>
                        </form>
                        {twoFactorConfirmState.error ? <p className="text-sm text-danger">{twoFactorConfirmState.error}</p> : null}
                        {twoFactorConfirmState.message ? <p className="text-sm text-accent">{twoFactorConfirmState.message}</p> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="border border-line-strong bg-surface p-4 md:p-5">
                <h2 className="text-xl md:text-2xl">Change Password</h2>
                <form action={pwAction} className="mt-4 grid gap-3 md:max-w-xl">
                  <input type="hidden" name="csrf" value={csrfToken} />
                  <input name="currentPassword" type="password" required placeholder="Current password" className="border border-line-strong bg-bg px-3 py-2" />
                  <input name="newPassword" type="password" required placeholder="New password" className="border border-line-strong bg-bg px-3 py-2" />
                  <input name="confirmPassword" type="password" required placeholder="Confirm new password" className="border border-line-strong bg-bg px-3 py-2" />
                  {pwState.error ? <p className="text-sm text-danger">{pwState.error}</p> : null}
                  {pwState.message ? <p className="text-sm text-accent">{pwState.message}</p> : null}
                  <Button disabled={pwPending} className="justify-self-start border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-accent">{pwPending ? "Saving..." : "Update password"}</Button>
                </form>
              </section>

              <section className="border border-line-strong bg-surface p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl md:text-2xl">Sessions</h2>
                  <LogoutOtherDevicesDialog csrfToken={csrfToken} />
                </div>
                <div className="mt-4 space-y-2">
                  {sessions.map((session) => (
                    <form key={session.id} action={revokeSession} className="flex flex-col justify-between gap-3 border border-line-strong p-3 md:flex-row md:items-center">
                      <input type="hidden" name="csrf" value={csrfToken} />
                      <input type="hidden" name="sessionId" value={session.id} />
                      <div className="text-sm">
                        <p className="flex items-center gap-2"><Monitor className="size-4" />{session.userAgent ?? "Unknown device"}</p>
                        <p className="mt-1 flex items-center gap-2 text-fg-muted"><Smartphone className="size-4" />{session.ipAddress ?? "Unknown IP"}</p>
                      </div>
                      <Button className="border border-danger bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger">Revoke</Button>
                    </form>
                  ))}
                </div>
              </section>
            </div>
          )}
          </AdminReveal>
        </section>
      </div>
    </main>
  );
};
