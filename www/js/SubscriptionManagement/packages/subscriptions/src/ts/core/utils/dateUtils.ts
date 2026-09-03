import { format, parse } from 'date-fns';

export const GetFullExpYear = (expYear: number): number =>
  Number.parseInt(format(parse(expYear.toString(), 'yy', new Date()), 'yyyy'), 10);

export const GetShortenedYearInputFormat = (year: string): string =>
  format(parse(year, 'yyyy', new Date()), 'yy');

export const GetShortenedMonthFormat = (month: number): string => month.toString().padStart(2, '0');

export const GetFormattedExpiration = (month: number, year: number): string =>
  `${GetShortenedMonthFormat(month)}/${GetShortenedYearInputFormat(year.toString())}`;

export const GetMonthAndYearFromFormattedExpiration = (expiration: string): [number, number] => {
  if (!expiration.includes('/')) {
    return [0, 0];
  }

  const [month, year] = expiration.split('/');

  if (
    !month ||
    !year ||
    Number.parseInt(month, 10) < 1 ||
    Number.parseInt(month, 10) > 12 ||
    year.length !== 2
  ) {
    return [0, 0];
  }

  return [Number.parseInt(month, 10), GetFullExpYear(Number.parseInt(year, 10))];
};

export const GetDateFromFormattedExpiration = (expiration: string): Date => {
  const [month, year] = GetMonthAndYearFromFormattedExpiration(expiration);
  if (month === 0 || year === 0) {
    return new Date();
  }

  return new Date(year, month - 1);
};
