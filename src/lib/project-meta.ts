export const projectMonthBySlug: Record<string, string> = {
  "levo-studio-tickets": "2026-03-01",
  "levo-studio-db-controller": "2026-04-01",
  "levo-studio-finance": "2026-04-01",
  vibevote: "2026-04-01",
  orbitaly: "2026-04-01",
  "juliusgrimm-portfolio-2025": "2025-01-01"
};

const formatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export const getProjectMonthLabel = (slug: string): string => {
  const iso = projectMonthBySlug[slug];
  if (!iso) return "April 2026";
  return formatter.format(new Date(`${iso}T00:00:00.000Z`));
};

export const getProjectMonthSortKey = (slug: string): number => {
  const iso = projectMonthBySlug[slug];
  if (!iso) return 0;
  return new Date(`${iso}T00:00:00.000Z`).getTime();
};

