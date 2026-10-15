import { maxSignUpAge, minSignUpAge } from "../constants/signupConstants";

/** A birthday picked in the signup form: full year, 0-indexed month and 1-indexed day. */
export type Birthday = {
  year?: number;
  month?: number;
  day?: number;
};

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
  day?: number,
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

/**
 * Attempts to construct a valid birthday date from a {@link Birthday}.
 * @returns the valid {@link Date}, `null` if the birthday is invalid, or `undefined` it could not
 * be determined if the date is valid or not (because one of the date parts was `undefined`).
 */
export const constructValidUTCBirthdate = ({
  year,
  month,
  day,
}: Birthday): Date | null | undefined => {
  const birthdate = constructUTCDatePartial(year, month, day);
  if (birthdate == null) {
    return birthdate;
  }

  const nowLocal = new Date();
  const nowUTC = new Date(
    Date.UTC(
      nowLocal.getUTCFullYear(),
      nowLocal.getUTCMonth(),
      nowLocal.getUTCDate(),
      nowLocal.getUTCHours(),
      nowLocal.getUTCMinutes(),
      nowLocal.getUTCSeconds(),
    ),
  );
  // If today is a leap day, subtracting 5 years will turn the date to March 1st.
  // Meaning, users born on March 1st trying to register on Feb 29th would not initially see an
  // error message until they submit the form. So instead, we set the day to the 28th.
  if (nowUTC.getDate() === 29 && nowUTC.getMonth() === 1) {
    nowUTC.setDate(28);
  }
  nowUTC.setUTCHours(0, 0, 0, 0);

  const maximumBirthday = new Date(nowUTC);
  maximumBirthday.setUTCFullYear(maximumBirthday.getUTCFullYear() - minSignUpAge);

  const minimumBirthday = new Date(nowUTC);
  minimumBirthday.setUTCFullYear(minimumBirthday.getUTCFullYear() - maxSignUpAge);

  return minimumBirthday <= birthdate && birthdate <= maximumBirthday ? birthdate : null;
};
