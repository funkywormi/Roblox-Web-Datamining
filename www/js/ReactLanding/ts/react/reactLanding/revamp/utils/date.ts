export const daysInMonthYear = (month: number, year?: number): number => {
  if (month === 1 && year == null) {
    return 29;
  }
  const date = new Date(year ?? 2000, month + 1, 0);
  return date.getDate();
};

/**
 * Attempts to construct a date from the given (full) year, month (0-indexed), and day (1-indexed).
 * @returns The {@link Date} or `null` if the date is invalid.
 */
export const constructUTCDate = (year: number, month: number, day: number): Date | null => {
  const date = new Date(Date.UTC(year, month, day));
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Attempts to construct a date from the given (full) year, month (0-indexed), and day (1-indexed).
 * @returns the valid {@link Date}, `null` if the date is invalid, or `undefined` it could not be
 * determined if the date is valid or not (because one of the date parts was `undefined`).
 */
export const constructUTCDatePartial = (
  year?: number,
  month?: number,
  day?: number
): Date | null | undefined => {
  if (month == null || day == null) {
    return undefined;
  }
  if (day > daysInMonthYear(month, year)) {
    return null;
  }
  if (year == null) {
    return undefined;
  }

  return constructUTCDate(year, month, day);
};
