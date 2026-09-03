import { Intl as RobloxIntl } from "Roblox";

// Bare duration, no direction word: NumberFormat rather than RelativeTimeFormat, because the latter
// always appends "ago" and would change every card's copy.
//
// unitDisplay "narrow" keeps the shape the stream already ships ("1w", "3h"), and is not localized
// for every language (ja stays Latin "2y").
const UNITS: Array<[Intl.NumberFormatOptions["unit"], number]> = [
  ["year", 31557600000],
  ["month", 2629800000],
  ["week", 604800000],
  ["day", 86400000],
  ["hour", 3600000],
  ["minute", 60000],
  ["second", 1000],
];

const formatters = new Map<string, Intl.NumberFormat>();

// Falls back to the runtime default rather than throwing: an unavailable locale must degrade to a
// formatted duration, not to a card with no timestamp.
const currentLocale = (): string | undefined => {
  try {
    return new RobloxIntl().getLocale() || undefined;
  } catch {
    return undefined;
  }
};

const format = (value: number, unit: Intl.NumberFormatOptions["unit"]): string => {
  const locale = currentLocale();
  const key = `${locale ?? "default"}:${unit}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "narrow" });
    formatters.set(key, formatter);
  }
  return formatter.format(value);
};

const fromUnits = (
  units: Array<[Intl.NumberFormatOptions["unit"], number]>,
  date1: Date,
  date2: Date,
): string => {
  // new Date(null) is Dec 31 1969 rather than an invalid date, so a null has to be caught first.
  if (!date1 || !date2 || Number.isNaN(date1.getTime()) || Number.isNaN(date2.getTime())) {
    return "";
  }

  const elapsed = Math.abs(date1.getTime() - date2.getTime());
  const match = units.find(([, weight]) => Math.floor(elapsed / weight) >= 1);
  if (!match) {
    // Under a second still reads as a duration rather than as nothing.
    return format(1, "second");
  }
  const [unit, weight] = match;
  return format(Math.floor(elapsed / weight), unit);
};

const getRelativeTime = (date1: Date, date2: Date): string => fromUnits(UNITS, date1, date2);

const DAY_CAPPED = UNITS.slice(UNITS.findIndex(([unit]) => unit === "day"));

// Days are the largest unit the notification stream shows, matching the Lua app: narrow renders month
// and minute identically in English, so two months read "2m" and collided with two minutes.
const getRelativeTimeMaxDays = (date1: Date, date2: Date): string =>
  fromUnits(DAY_CAPPED, date1, date2);

export { getRelativeTime as default, getRelativeTimeMaxDays };
