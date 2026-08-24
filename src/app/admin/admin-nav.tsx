"use client";

import { useEffect } from "react";
import Image from "next/image";
import { FileText, LayoutDashboard, Settings, Tags, X } from "lucide-react";

export type AdminTab = "overview" | "case-studies" | "survival-kit" | "settings";

const ITEMS: { value: AdminTab; label: string; Icon: typeof FileText }[] = [
  { value: "overview", label: "Overview", Icon: LayoutDashboard },
  { value: "case-studies", label: "Case studies", Icon: FileText },
  { value: "survival-kit", label: "Survival kit", Icon: Tags },
  { value: "settings", label: "Settings", Icon: Settings }
];

type NavListProps = {
  tab: AdminTab;
  onSelect: (tab: AdminTab) => void;
};

const NavList = ({ tab, onSelect }: NavListProps): React.JSX.Element => (
  <nav className="flex flex-col">
    {ITEMS.map((item) => {
      const active = tab === item.value;
      return (
        <button
          key={item.value}
          type="button"
          data-nav-item
          data-active={active}
          onClick={() => onSelect(item.value)}
          aria-current={active ? "page" : undefined}
          className={`nav-item relative flex items-center gap-3 py-2.5 pr-3 pl-4 text-left text-[13px] ${
            active ? "bg-tint text-fg" : "text-fg-muted hover:bg-tint hover:text-fg"
          }`}
        >
          <item.Icon className={`size-4 ${active ? "text-accent" : ""}`} />
          {item.label}
        </button>
      );
    })}
  </nav>
);

type AdminNavProps = {
  tab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export const AdminNav = ({ tab, onSelect, mobileOpen, onCloseMobile }: AdminNavProps): React.JSX.Element => {
  // Escape closes the drawer, and the page behind it stops scrolling while it is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onCloseMobile();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen self-start border-r border-line md:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-line px-4 py-[18px]">
            <Image src="/jg_logo.png" alt="" width={18} height={18} className="size-[18px]" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">Admin</span>
          </div>
          <div className="py-3">
            <NavList tab={tab} onSelect={onSelect} />
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseMobile}
            className="drawer-backdrop absolute inset-0 h-full w-full bg-bg/70 backdrop-blur-sm"
          />
          <div className="drawer-panel absolute inset-y-0 left-0 flex w-[248px] flex-col border-r border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-[18px]">
              <span className="flex items-center gap-3">
                <Image src="/jg_logo.png" alt="" width={18} height={18} className="size-[18px]" />
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-fg-muted">Admin</span>
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="text-fg-muted transition-colors hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="py-3">
              <NavList
                tab={tab}
                onSelect={(next) => {
                  onSelect(next);
                  onCloseMobile();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
