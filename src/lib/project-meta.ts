const formatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

const monthMap: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};

export const parseProjectMonthInput = (value: string | undefined): Date | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  const monthYearMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, rawMonth, rawYear] = monthYearMatch;
    const monthIndex = monthMap[rawMonth.toLowerCase()];
    if (monthIndex === undefined) return null;
    return new Date(Date.UTC(Number(rawYear), monthIndex, 1, 0, 0, 0, 0));
  }

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, rawYear, rawMonth, rawDay] = isoDateMatch;
    return new Date(Date.UTC(Number(rawYear), Number(rawMonth) - 1, Number(rawDay), 0, 0, 0, 0));
  }

  const isoTimestampMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}T/);
  if (isoTimestampMatch) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  return null;
};

export const getProjectMonthLabel = (value: Date | string | null | undefined): string => {
  if (!value) return "April 2026";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "April 2026";
  return formatter.format(parsed);
};

const shortFormatter = new Intl.DateTimeFormat("en-US", { month: "2-digit", year: "numeric", timeZone: "UTC" });

/** "07 / 2026" — the compact form the project rows and case-study headers use. */
export const getProjectMonthShort = (value: Date | string | null | undefined): string => {
  const parsed = value instanceof Date ? value : value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return "";
  const [month, year] = shortFormatter.format(parsed).split("/");
  return `${month.trim()} / ${year.trim()}`;
};
