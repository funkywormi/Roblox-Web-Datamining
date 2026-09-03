import { parse } from 'date-fns';
import { Intl } from 'Roblox';

export const getFullExpYear = (shortenedExpYear: number): number =>
  parse(shortenedExpYear.toString(), 'yy', new Date()).getFullYear();

export const getShortenedDateFormat = (year: number, month: number): string =>
  `${new Intl().getDateTimeFormatter().getCustomDateTime(new Date(year, month - 1), {
    year: '2-digit',
    month: '2-digit'
  })}`;

export const getMonthAndYearFromFormattedExpiration = (expiration: string): [number, number] => {
  const date = parse(expiration, 'MM/yy', new Date());

  if (date.toString() === 'Invalid Date') {
    return [0, 0];
  }

  return [date.getMonth() + 1, date.getFullYear()];
};

export const getDateFromFormattedExpiration = (expiration: string): Date => {
  const date = parse(expiration, 'MM/yy', new Date());

  if (date.toString() === 'Invalid Date') {
    return new Date();
  }

  return date;
};
