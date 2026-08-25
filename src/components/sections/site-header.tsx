"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SCROLL_TARGET_STORAGE_KEY, SKIP_ENTRANCE_STORAGE_KEY } from "@/components/sections/scroll-to-hash";

const NAV = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
  { label: "Levo Studio", href: "#levo-studio" }
];

type SiteHeaderProps = {
  /** Case-study pages swap the nav for a single way back. */
  back?: { label: string; href: string };
};

export const SiteHeader = ({ back }: SiteHeaderProps): React.JSX.Element => {
  const router = useRouter();
  const backHash = back?.href.includes("#") ? back.href.slice(back.href.indexOf("#")) : undefined;

  return (
    <header className="flex items-center justify-between px-[22px] py-4 md:px-14 md:py-[22px]">
      <Link href="/" aria-label="Julius Grimm — home">
        <Image src="/jg_logo.png" alt="" width={22} height={22} className="size-5 md:size-[22px]" priority />
      </Link>

      {back ? (
        <Link
          href={back.href}
          // Navigating straight to the hash makes the browser scroll there
          // itself, smoothly, before ScrollToHash's effect ever gets a turn to
          // make it instant — so this skips the native hash-scroll entirely by
          // routing to the plain path and handing the target off through
          // sessionStorage instead. Ordinary anchor nav (About, Projects, ...)
          // is untouched and keeps the smooth scroll.
          onClick={(event) => {
            if (!backHash) return;
            event.preventDefault();
            sessionStorage.setItem(SCROLL_TARGET_STORAGE_KEY, backHash);
            sessionStorage.setItem(SKIP_ENTRANCE_STORAGE_KEY, "1");
            router.push(back.href.slice(0, back.href.indexOf("#")) || "/");
          }}
          className="text-[12px] text-fg-muted transition-colors hover:text-fg"
        >
          {back.label}
        </Link>
      ) : (
        <div className="flex items-center gap-3 md:gap-[26px]">
          <nav className="hidden items-center gap-[26px] text-[12px] text-fg-muted md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-fg">
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle compact />
        </div>
      )}
    </header>
  );
};
