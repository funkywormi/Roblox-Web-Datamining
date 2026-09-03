import { Intl } from "@rbx/core-scripts/legacy/Roblox";
import { TUserBirthdate } from "../types/birthdateTypes";

/* 
new Date(YYYY, MM, DD) is NOT equivalent to new Date(YYYY-MM-DD) in JavaScript.
const date1 = new Date(1995, 11, 10);
date 1 is Sun Dec 10 1995 00:00:00 GMT

const date2 = new Date('1995-12-10');
date 2 is Sun Dec 17 1995 16:00:00 GMT...

so we need to add timezone offset to ISO string to get the correct date.
*/
const intl: Intl = new Intl();
const birthdayUtils = {
  formatBirthdate: (birthdateObject?: TUserBirthdate): string => {
    if (!birthdateObject) {
      return "";
    }
    const date = new Date(
      birthdateObject.birthYear,
      birthdateObject.birthMonth - 1,
      birthdateObject.birthDay,
    );

    return intl.getDateTimeFormatter().getCustomDateTime(
      //   Note: The month in TUserBirthdate is 1-indexed (1 = January), while the month in
      //   getCustomDateTime is 0-indexed (0 = January).
      date,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  },
  formatBirthdateFromISO: (isoDate: string): string => {
    const date = new Date(isoDate);
    const offset = date.getTimezoneOffset();
    const absoluteDate = new Date(date.getTime() + offset * 60 * 1000);
    return intl.getDateTimeFormatter().getCustomDateTime(absoluteDate, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },
  birthdateToIsoString: (birthdate: TUserBirthdate): string => {
    const { birthDay, birthMonth, birthYear } = birthdate;
    const month = birthMonth < 10 ? `0${birthMonth}` : birthMonth;
    const day = birthDay < 10 ? `0${birthDay}` : birthDay;
    return `${birthYear}-${month}-${day}`;
  },
  dateToBirthdate: (date: Date): TUserBirthdate => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return {
      birthDay: day,
      birthMonth: month,
      birthYear: year,
    };
  },
  isoStringToBirthdate: (isoDate: string): TUserBirthdate =>
    birthdayUtils.dateToBirthdate(new Date(birthdayUtils.formatBirthdateFromISO(isoDate))),
  dateInUTCToBirthdate: (date: Date): TUserBirthdate => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    return {
      birthDay: day,
      birthMonth: month,
      birthYear: year,
    };
  },
  calculateAge: (birthdate?: TUserBirthdate): number => {
    if (!birthdate?.birthYear || birthdate.birthYear === 0) {
      return 0;
    }
    const now = new Date();
    const formattedTodaysDate = birthdayUtils.dateInUTCToBirthdate(now);
    const diffInDays = formattedTodaysDate.birthDay - birthdate.birthDay;
    if (diffInDays < 0) {
      formattedTodaysDate.birthMonth -= 1;
    }
    const diffInMonths = formattedTodaysDate.birthMonth - birthdate.birthMonth;
    if (diffInMonths < 0) {
      formattedTodaysDate.birthYear -= 1;
    }
    const diffInYears = formattedTodaysDate.birthYear - birthdate.birthYear;
    return diffInYears;
  },
  calculateAgeFromISO: (isoDate?: string): number => {
    if (!isoDate) {
      return 0;
    }
    const date = new Date(isoDate);
    const offset = date.getTimezoneOffset();
    const absoluteDate = new Date(date.getTime() + offset * 60 * 1000);
    const birthdate = birthdayUtils.dateToBirthdate(absoluteDate);
    return birthdayUtils.calculateAge(birthdate);
  },
  /**
   * Clamp birthdate.birthDay to closest valid value if it exceeds the limit (ex Apr 31st -> Apr 30th)
   * The logic here is based on the fact that the Date object overflows the month
   * if number of Date passed is greater than valid number of days for that
   * calendar month. eg new Date(2023, 0, 32) is equivalent to new Date(2023, 1, 1)
   * i.e both will produce the date Febraury 1st, 2023.
   *
   * @param {TUserBirthdate} birthdate object contianing all parts of the
   * birthdate
   * {
   *   birthDay: number (index 1-12)
   *   birthMonth: number (index 1-31)
   *   birthYear: number (YYYY)
   * }
   * @returns {TUserBirthdate} Clamped birthdate.
   */
  getClosestValidDay: (birthdate: TUserBirthdate): TUserBirthdate => {
    const birthMonth = birthdate.birthMonth - 1; // zero indexed months
    let { birthDay } = birthdate;

    const buildDate = (day: number): Date => new Date(birthdate.birthYear, birthMonth, day);
    let tempDate = buildDate(birthDay);

    while (tempDate.getMonth() > birthMonth) {
      birthDay -= 1;
      tempDate = buildDate(birthDay);
    }

    return { ...birthdate, birthDay };
  },
  birthdateSeletionCompleted: (birthdate: TUserBirthdate): boolean => {
    const { birthDay, birthMonth, birthYear } = birthdate;
    return birthDay > 0 && birthMonth > 0 && birthYear > 0;
  },
  isSelectingTheSameDate: (
    selectedBirthdate: TUserBirthdate,
    birthdate?: TUserBirthdate,
  ): boolean =>
    birthdate?.birthDay === selectedBirthdate.birthDay &&
    birthdate.birthMonth === selectedBirthdate.birthMonth &&
    birthdate.birthYear === selectedBirthdate.birthYear,
  isValidBirthdate: (birthdate?: TUserBirthdate): boolean => {
    if (!birthdate) {
      return false;
    }
    const { birthDay, birthMonth, birthYear } = birthdate;
    let numberOfDays = 31;
    if (birthdayUtils.birthdateSeletionCompleted(birthdate)) {
      const date = new Date(birthYear, birthMonth, 0);
      numberOfDays = date.getDate();
    }
    return (
      birthYear > 0 &&
      birthYear <= new Date().getFullYear() &&
      birthMonth > 0 &&
      birthMonth <= 12 &&
      birthDay > 0 &&
      birthDay <= numberOfDays
    );
  },
  initialBirthday: { birthMonth: 0, birthDay: 0, birthYear: 0 },
};

export default birthdayUtils;
