import { cn } from "@/lib/utils";

type SectionShellProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  /**
   * Sections fade up on scroll. About opts out deliberately — its one paragraph
   * sits high enough on the page that revealing it just delayed the first thing
   * a visitor reads.
   */
  reveal?: boolean;
};

export const SectionShell = ({ label, children, className, id, reveal = true }: SectionShellProps): React.JSX.Element => (
  <section
    id={id}
    {...(reveal ? { "data-reveal": "" } : {})}
    className={cn("grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-[120px_minmax(0,1fr)]", className)}
  >
    <p className="font-mono text-[10px] font-medium uppercase leading-[1.6] tracking-[0.16em] text-fg-muted md:pt-[7px]">
      {label}
    </p>
    <div className="min-w-0">{children}</div>
  </section>
);
