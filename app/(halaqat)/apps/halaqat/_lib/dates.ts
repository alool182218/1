const TZ = "Asia/Riyadh";

/** Today's date in Riyadh as YYYY-MM-DD. */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

/** Shift a YYYY-MM-DD date by a number of days. */
export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function monthStart(day: string): string {
  return `${day.slice(0, 7)}-01`;
}

const at = (day: string) => new Date(`${day}T12:00:00Z`);

const gregorian = new Intl.DateTimeFormat("ar", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const short = new Intl.DateTimeFormat("ar", { day: "numeric", month: "short", timeZone: "UTC" });

export const formatDay = (day: string) => gregorian.format(at(day));
export const formatHijri = (day: string) => hijri.format(at(day));
export const formatShort = (day: string) => short.format(at(day));
