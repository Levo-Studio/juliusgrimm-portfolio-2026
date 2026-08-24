"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import gsap from "gsap";
import { startRegistration } from "@simplewebauthn/browser";
import { Menu, ShieldCheck, Monitor, Smartphone, KeyRound, LogOut, FolderOpen, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PasswordState, TwoFactorState } from "@/app/admin/actions";
import { changePassword, confirmTwoFactorSetup, deletePasskey, disableTwoFactor, logoutAdmin, revokeSession, saveSurvivalKitTags, startTwoFactorSetup, toggleProjectVisibility } from "@/app/admin/actions";
import { SurvivalKitTagEditor } from "@/app/admin/survival-kit-tag-editor";
import { AdminReveal } from "@/app/admin/admin-reveal";
import { AdminNav, type AdminTab } from "@/app/admin/admin-nav";
import { DeleteProjectDialog } from "@/app/admin/projects/delete-project-dialog";
import { LogoutOtherDevicesDialog } from "@/app/admin/logout-other-devices-dialog";
import { ProjectIcon } from "@/components/shared/project-icon";
import type { ColorCategory } from "@/types/project";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  subtitle: string;
  visible: boolean;
  imageUrl: string | null;
  faviconUrl: string | null;
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
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
        <AdminNav tab={tab} onSelect={setTab} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <section className="min-w-0 px-5 py-6 md:px-8 md:py-7">
          {/* Each tab states where you are, so the shell only carries the controls. */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-md border border-line-strong p-2 text-fg-muted transition-colors hover:border-line-field hover:text-fg md:hidden"
            >
              <Menu className="size-4" />
            </button>
            <span className="hidden md:block" />
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-md border border-line-strong px-3 py-[7px] text-[12px] text-fg-muted transition-colors hover:border-line-field hover:text-fg"
              >
                <LogOut className="size-3.5" />
                Log out
              </button>
            </form>
          </div>

          {saved ? (
            <div className="mb-5 rounded-md border border-accent/40 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-3 text-[13px] text-accent">
              Saved successfully.
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mb-5 rounded-md border border-danger/40 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-3 text-[13px] text-danger">
              {errorMessage}
            </div>
          ) : null}

          <AdminReveal key={tab}>
          {tab === "case-studies" ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">
                  Admin / Case studies
                </p>
                <Link
                  href="/admin/projects/new"
                  className="rounded-md bg-accent px-[13px] py-2 text-[12px] font-medium text-accent-fg"
                >
                  Add case study
                </Link>
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
                    <ProjectIcon src={project.faviconUrl} title={project.title} size={18} />

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
            <div className="space-y-6">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">
                Admin / Survival kit
              </p>
              <section className="rounded-[10px] border border-line-strong bg-surface p-5 md:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-[20px] font-light tracking-[-0.02em] md:text-[22px]">Survival kit</h2>
                    <p className="mt-1.5 text-[12px] leading-[1.6] text-fg-muted">These are the tags on the homepage stack section.</p>
                  </div>
                  <Link href="/#tech-stack" className="text-[12px] text-accent transition-opacity hover:opacity-80">View homepage</Link>
                </div>
                <form action={saveSurvivalKitTags} className="space-y-5">
                  <input type="hidden" name="csrf" value={csrfToken} />
                  <SurvivalKitTagEditor initialTags={survivalTags.map((tag, index) => ({ ...tag, sortOrder: index + 1 }))} />
                  <Button>
                    Save tags
                  </Button>
                </form>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">
                Admin / Settings
              </p>
              <section className="rounded-[10px] border border-line-strong bg-surface p-5 md:p-6">
                <h2 className="m-0 text-[20px] font-light tracking-[-0.02em] md:text-[22px]">Security</h2>
                <p className="mt-1.5 text-[12px] leading-[1.6] text-fg-muted">Passkeys and 2FA controls.</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[7px] border border-line p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="m-0 text-[15px]">Passkeys</h3>
                      <Button type="button" onClick={registerPasskey} disabled={passkeyPending} variant="ghost">
                        <KeyRound className="mr-2 size-4" />
                        {passkeyPending ? "Registering…" : "Register passkey"}
                      </Button>
                    </div>
                    {passkeyError ? <p className="mb-3 text-[12px] text-danger">{passkeyError}</p> : null}
                    <div className="space-y-2">
                      {passkeys.length === 0 ? (
                        <p className="text-[12px] text-fg-muted">No passkeys registered yet.</p>
                      ) : (
                        passkeys.map((passkey) => (
                          <form key={passkey.id} action={deletePasskey} className="flex flex-wrap items-center justify-between gap-3 rounded-[7px] border border-line p-3">
                            <input type="hidden" name="csrf" value={csrfToken} />
                            <input type="hidden" name="authenticatorId" value={passkey.id} />
                            <div className="text-[12px]">
                              <p>{passkey.deviceType}</p>
                              <p className="text-fg-muted">Created: {new Date(passkey.createdAt).toLocaleString("de-DE")}</p>
                              <p className="text-fg-muted">Last used: {passkey.lastUsedAt ? new Date(passkey.lastUsedAt).toLocaleString("de-DE") : "Never"}</p>
                            </div>
                            <Button variant="danger">Delete</Button>
                          </form>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[7px] border border-line p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="m-0 text-[15px]">Two-factor authentication</h3>
                      {twoFactorEnabled ? (
                        <form action={disableTwoFactor}>
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <Button variant="danger">
                            <ShieldCheck className="mr-2 size-4" />
                            Disable 2FA
                          </Button>
                        </form>
                      ) : (
                        <form action={twoFactorSetupAction}>
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <Button disabled={twoFactorSetupPending} variant="ghost">
                            <ShieldCheck className="mr-2 size-4" />
                            {twoFactorSetupPending ? "Preparing..." : "Setup 2FA"}
                          </Button>
                        </form>
                      )}
                    </div>

                    {twoFactorEnabled ? <p className="text-sm text-accent">2FA is currently enabled.</p> : null}
                    {twoFactorState.error ? <p className="text-[12px] text-danger">{twoFactorState.error}</p> : null}
                    {twoFactorState.message ? <p className="text-sm text-accent">{twoFactorState.message}</p> : null}

                    {twoFactorState.qrDataUrl ? (
                      <div className="mt-3 space-y-3">
                        <Image src={twoFactorState.qrDataUrl} alt="2FA QR Code" width={180} height={180} className="rounded-[7px] border border-line-strong bg-white p-2" unoptimized />
                        <p className="break-all text-xs text-fg-muted">Secret: {twoFactorState.secret}</p>
                        <form action={twoFactorConfirmAction} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="csrf" value={csrfToken} />
                          <input name="code" placeholder="123456" inputMode="numeric" className="rounded-[7px] border border-line-strong bg-bg px-3 py-2" />
                          <Button disabled={twoFactorConfirmPending} >
                            {twoFactorConfirmPending ? "Verifying..." : "Enable 2FA"}
                          </Button>
                        </form>
                        {twoFactorConfirmState.error ? <p className="text-[12px] text-danger">{twoFactorConfirmState.error}</p> : null}
                        {twoFactorConfirmState.message ? <p className="text-sm text-accent">{twoFactorConfirmState.message}</p> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="rounded-[10px] border border-line-strong bg-surface p-5 md:p-6">
                <h2 className="m-0 text-[20px] font-light tracking-[-0.02em] md:text-[22px]">Change password</h2>
                <form action={pwAction} className="mt-4 grid gap-3 md:max-w-xl">
                  <input type="hidden" name="csrf" value={csrfToken} />
                  <input name="currentPassword" type="password" required placeholder="Current password" className="rounded-[7px] border border-line-strong bg-bg px-3 py-2" />
                  <input name="newPassword" type="password" required placeholder="New password" className="rounded-[7px] border border-line-strong bg-bg px-3 py-2" />
                  <input name="confirmPassword" type="password" required placeholder="Confirm new password" className="rounded-[7px] border border-line-strong bg-bg px-3 py-2" />
                  {pwState.error ? <p className="text-[12px] text-danger">{pwState.error}</p> : null}
                  {pwState.message ? <p className="text-sm text-accent">{pwState.message}</p> : null}
                  <Button disabled={pwPending} className="justify-self-start">{pwPending ? "Saving…" : "Update password"}</Button>
                </form>
              </section>

              <section className="rounded-[10px] border border-line-strong bg-surface p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="m-0 text-[20px] font-light tracking-[-0.02em] md:text-[22px]">Sessions</h2>
                  <LogoutOtherDevicesDialog csrfToken={csrfToken} />
                </div>
                <div className="mt-4 space-y-2">
                  {sessions.map((session) => (
                    <form key={session.id} action={revokeSession} className="flex flex-col justify-between gap-3 rounded-[7px] border border-line-strong p-3 md:flex-row md:items-center">
                      <input type="hidden" name="csrf" value={csrfToken} />
                      <input type="hidden" name="sessionId" value={session.id} />
                      <div className="text-[12px]">
                        <p className="flex items-center gap-2"><Monitor className="size-4" />{session.userAgent ?? "Unknown device"}</p>
                        <p className="mt-1 flex items-center gap-2 text-fg-muted"><Smartphone className="size-4" />{session.ipAddress ?? "Unknown IP"}</p>
                      </div>
                      <Button variant="danger">Revoke</Button>
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
