import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/sections/site-header";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: true
  }
};

/** Somewhere useful to go, in the same row treatment the rest of the site uses. */
const DESTINATIONS = [
  { label: "Projects", note: "A collection of overengineered ideas.", href: "/#projects" },
  { label: "About", note: "Who is behind all of this.", href: "/#about" },
  { label: "Contact", note: "One more side project won't hurt.", href: "/#contact" }
];

export default function NotFound(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col bg-bg text-fg">
      <SiteHeader back={{ label: "← Home", href: "/" }} />

      <div className="grid flex-1 grid-cols-1 content-start gap-x-10 gap-y-4 px-[22px] pt-16 pb-10 md:grid-cols-[120px_minmax(0,640px)] md:px-14 md:pt-24">
        <p className="font-mono text-[10px] font-medium uppercase leading-[1.6] tracking-[0.16em] text-accent md:pt-[7px]">
          404
        </p>
        <div>
          <h1 className="m-0 text-[30px] font-light leading-[1.16] tracking-[-0.022em] md:text-[42px] md:leading-[1.14] md:tracking-[-0.024em]">
            This page does not exist.
          </h1>
          <p className="m-0 mt-2.5 text-[15px] leading-[1.55] text-fg-muted md:mt-3 md:text-[17px] md:leading-[1.6]">
            Probably overengineered into another route.
          </p>

          <div className="mt-8 flex flex-col border-t border-line md:mt-10">
            {DESTINATIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="row-link flex flex-col gap-1 border-b border-line px-1 py-[13px] md:grid md:grid-cols-[140px_minmax(0,1fr)] md:items-baseline md:gap-[18px] md:px-3 md:py-3.5"
              >
                <span className="text-[14px] md:text-[15px]">{item.label}</span>
                <span className="text-[12px] leading-[1.35] text-fg-muted md:text-[13px]">{item.note}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-line px-[22px] py-[18px] font-mono text-[10px] leading-[1.7] text-fg-faint md:px-14 md:py-[22px] md:text-[11px] md:leading-[1.6]">
        © {new Date().getFullYear()} Julius Grimm · Made with ❤️ and 47 open tabs.
      </footer>
    </main>
  );
}
