import International from "@rbx/core-scripts/intl";

const intl = new International();

export const formatIntlNumber = (num: number): string => {
  return intl.n(num);
};

const DATE_FORMAT_LOCALE = "default";
const DATE_FORMAT_YEAR = "2-digit";
const DATE_FORMAT_MONTH = "2-digit";
export const formatExpirationDate = (year: number, month: number): string => {
  return new Intl.DateTimeFormat(DATE_FORMAT_LOCALE, {
    year: DATE_FORMAT_YEAR,
    month: DATE_FORMAT_MONTH,
  }).format(new Date(year, month - 1));
};
