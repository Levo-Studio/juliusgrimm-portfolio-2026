import Link from "next/link";
import { getLastMainCommit } from "@/server/github";

const lastTouchedFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

export const SiteFooter = async (): Promise<React.JSX.Element> => {
  const lastCommit = await getLastMainCommit();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto flex flex-col gap-2 border-t border-line px-[22px] py-[18px] font-mono text-[10px] leading-[1.7] text-fg-faint md:px-14 md:py-[22px] md:text-[11px] md:leading-[1.6] min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
      <span>© {currentYear} Julius Grimm · Made with ❤️ and 47 open tabs.</span>
      <span className="flex gap-[18px]">
        {lastCommit ? (
          <Link href={lastCommit.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">
            Last touched {lastTouchedFormatter.format(lastCommit.date)}
          </Link>
        ) : null}
        <Link
          href="https://github.com/Levo-Studio/juliusgrimm-portfolio-2026"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-fg"
        >
          Source code
        </Link>
        <Link href="/impressum" className="transition-colors hover:text-fg">
          Legal notice
        </Link>
      </span>
    </footer>
  );
};
