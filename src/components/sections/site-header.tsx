import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const NAV = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" }
];

type SiteHeaderProps = {
  /** Case-study pages swap the nav for a single way back. */
  back?: { label: string; href: string };
};

export const SiteHeader = ({ back }: SiteHeaderProps): React.JSX.Element => (
  <header className="flex items-center justify-between px-[22px] py-4 md:px-14 md:py-[22px]">
    <Link href="/" aria-label="Julius Grimm — home">
      <Image src="/jg_logo.png" alt="" width={22} height={22} className="size-5 md:size-[22px]" priority />
    </Link>

    {back ? (
      <Link href={back.href} className="text-[12px] text-fg-muted transition-colors hover:text-fg">
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
