import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";

/**
 * Default date formatter used when the host does not provide `formatFullDate`.
 * Produces locale-aware output like "January 1, 2025, 12:00 PM".
 */
const defaultFormatFullDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export function useFormatFullDate(): (date: string) => string {
  const { formatFullDate } = useNotApprovedUIConfig();
  return formatFullDate ?? defaultFormatFullDate;
}

export default function getFormattedFullDate(
  date: string,
  formatFullDate?: (isoDate: string) => string,
): string {
  return (formatFullDate ?? defaultFormatFullDate)(date);
}
