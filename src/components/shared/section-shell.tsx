import { cn } from "@/lib/utils";

type SectionShellProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export const SectionShell = ({ label, children, className }: SectionShellProps): React.JSX.Element => {
  return (
    <section data-reveal className={cn("grid grid-cols-1 gap-6 md:grid-cols-[120px_minmax(0,1fr)] md:gap-8", className)}>
      <p className="font-inria text-[13px] uppercase leading-none tracking-[0.04em] text-white/85 md:pt-1 md:text-[13px]">{label}</p>
      <div>{children}</div>
    </section>
  );
};
