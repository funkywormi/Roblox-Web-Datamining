/**
 * Time utilities for converting between minutes from midnight and display formats.
 * Used by time picker components throughout the application.
 */

export type TTimeComponents = {
  hour: number;
  minute: number;
  isPM: boolean;
};

export type TDropdownOption = { label: string; value: string };

/**
 * Converts minutes from midnight to a formatted time string
 * @param minutes - Number of minutes from midnight (0-1439)
 * @param amLabel - Translated AM label
 * @param pmLabel - Translated PM label
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const minutesToTimeString = (minutes: number, amLabel: string, pmLabel: string): string => {
  const clampedMinutes = Math.max(0, Math.min(1439, minutes));

  const hours24 = Math.floor(clampedMinutes / 60);
  const mins = clampedMinutes % 60;

  let hours12: number;
  if (hours24 === 0) {
    hours12 = 12;
  } else if (hours24 > 12) {
    hours12 = hours24 - 12;
  } else {
    hours12 = hours24;
  }
  const isPM = hours24 >= 12;

  const formattedMinutes = mins.toString().padStart(2, "0");
  const ampmLabel = isPM ? pmLabel : amLabel;

  return `${hours12}:${formattedMinutes} ${ampmLabel}`;
};

/**
 * Converts minutes from midnight to separate hour, minute, and AM/PM components
 * @param minutes - Number of minutes from midnight (0-1439)
 * @returns Object with hour (1-12), minute (0-59), and isPM boolean
 */
export const minutesToTimeComponents = (minutes: number): TTimeComponents => {
  const clampedMinutes = Math.max(0, Math.min(1439, minutes));

  const hours24 = Math.floor(clampedMinutes / 60);
  const mins = clampedMinutes % 60;

  let hours12: number;
  if (hours24 === 0) {
    hours12 = 12;
  } else if (hours24 > 12) {
    hours12 = hours24 - 12;
  } else {
    hours12 = hours24;
  }

  const isPM = hours24 >= 12;

  return { hour: hours12, minute: mins, isPM };
};

/**
 * Converts hour, minute, and AM/PM components to minutes from midnight
 * @param hour - Hour in 12-hour format (1-12)
 * @param minute - Minute (0-59)
 * @param isPM - Whether it's PM
 * @returns Number of minutes from midnight
 */
export const timeComponentsToMinutes = (hour: number, minute: number, isPM: boolean): number => {
  let hours24 = hour;
  if (isPM && hour !== 12) {
    hours24 += 12;
  } else if (!isPM && hour === 12) {
    hours24 = 0;
  }

  return hours24 * 60 + minute;
};

/**
 * Generates dropdown options for hours (1-12)
 */
export const generateHourOptions = (): TDropdownOption[] => {
  const options: TDropdownOption[] = [];
  for (let i = 1; i <= 12; i += 1) {
    options.push({ label: i.toString(), value: i.toString() });
  }
  return options;
};

/**
 * Generates dropdown options for minutes with 15-minute granularity
 */
export const generateMinuteOptions = (): TDropdownOption[] => {
  const options: TDropdownOption[] = [];
  for (let i = 0; i < 60; i += 15) {
    const formatted = i.toString().padStart(2, "0");
    options.push({ label: formatted, value: i.toString() });
  }
  return options;
};

/**
 * Generates dropdown options for AM/PM
 * @param amLabel - Translated AM label
 * @param pmLabel - Translated PM label
 */
export const generateAmPmOptions = (amLabel: string, pmLabel: string): TDropdownOption[] => {
  return [
    { label: amLabel, value: "AM" },
    { label: pmLabel, value: "PM" },
  ];
};
