import { Intl as RobloxIntl } from 'Roblox';

const { locale } = new RobloxIntl();

export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, options);
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' });
};

export const formatFullDateTime = (dateString: string): string => {
  const datePart = formatDate(dateString, { month: 'short', day: 'numeric', year: 'numeric' });
  const timePart = formatTime(dateString);
  return `${datePart} | ${timePart}`;
};
