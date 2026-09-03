const unitMeasures: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31557600000],
  ["month", 2629800000],
  ["week", 604800000],
  ["day", 86400000],
  ["hour", 3600000],
  ["minute", 60000],
  ["second", 1000],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
  style: "narrow",
});

export const getRelativeTime = (date: Date): string => {
  const nowMs = Date.now();
  const diffMs = date.getTime() - nowMs;
  const absDiffMs = Math.abs(diffMs);

  for (const [unit, unitValueMs] of unitMeasures) {
    if (absDiffMs >= unitValueMs) {
      const wholeUnits = Math.floor(absDiffMs / unitValueMs);
      const signedUnits = diffMs < 0 ? -wholeUnits : wholeUnits;

      return relativeTimeFormatter.format(signedUnits, unit);
    }
  }

  return relativeTimeFormatter.format(0, "second");
};

const currentDayTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const previousDayFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export const getAbsoluteTime = (date: Date): string => {
  const now = new Date();
  const isCurrentDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isCurrentDay) {
    return currentDayTimeFormatter.format(date);
  }

  return previousDayFormatter.format(date);
};
