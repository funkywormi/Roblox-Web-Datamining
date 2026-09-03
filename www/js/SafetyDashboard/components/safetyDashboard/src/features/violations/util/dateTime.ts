import Intl from "@rbx/core-scripts/intl";

const intl = new Intl();
export const formatter = intl.getDateTimeFormatter();

/**
 * Formats a violation row timestamp to match the design mock, e.g.
 * "Dec 25, 2026 | 10:10 AM". Delegates to `getFullDate` so the list rows use
 * the same "date | time" format (separated by "|") as the appeal timeline.
 */
export const formatRowTimestamp = (timestamp: string): string => formatter.getFullDate(timestamp);
