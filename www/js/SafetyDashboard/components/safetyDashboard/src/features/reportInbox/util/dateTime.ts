import Intl from "@rbx/core-scripts/intl";

const intl = new Intl();
const formatter = intl.getDateTimeFormatter();

/**
 * Formats a report inbox date (YYYY-MM-DD) in the user's locale.
 */
export const formatReportDate = (date: string): string =>
  formatter.getCustomDateTime(date, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
