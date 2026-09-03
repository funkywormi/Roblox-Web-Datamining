/**
 * Converts minutes from midnight to a formatted time string
 * @param minutes - Number of minutes from midnight (0-1439)
 * @param amLabel - Translated AM label
 * @param pmLabel - Translated PM label
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const minutesToTimeString = (minutes: number, amLabel: string, pmLabel: string): string => {
  // Ensure minutes is within valid range
  const clampedMinutes = Math.max(0, Math.min(1439, minutes));

  const hours24 = Math.floor(clampedMinutes / 60);
  const mins = clampedMinutes % 60;

  // Convert to 12-hour format
  let hours12;
  if (hours24 === 0) {
    hours12 = 12;
  } else if (hours24 > 12) {
    hours12 = hours24 - 12;
  } else {
    hours12 = hours24;
  }
  const isPM = hours24 >= 12;

  // Format minutes with leading zero if needed
  const formattedMinutes = mins.toString().padStart(2, '0');

  // Get AM/PM label
  const ampmLabel = isPM ? pmLabel : amLabel;

  return `${hours12}:${formattedMinutes} ${ampmLabel}`;
};

/**
 * Converts minutes from midnight to separate hour, minute, and AM/PM components
 * @param minutes - Number of minutes from midnight (0-1439)
 * @returns Object with hour (1-12), minute (0-59), and isPM boolean
 */
export const minutesToTimeComponents = (
  minutes: number
): { hour: number; minute: number; isPM: boolean } => {
  const clampedMinutes = Math.max(0, Math.min(1439, minutes));

  const hours24 = Math.floor(clampedMinutes / 60);
  const mins = clampedMinutes % 60;

  let hours12;
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
 * @returns Array of hour options
 */
export const generateHourOptions = (): Array<{ label: string; value: string }> => {
  const options: { label: string; value: string }[] = [];
  for (let i = 1; i <= 12; i++) {
    options.push({ label: i.toString(), value: i.toString() });
  }
  return options;
};

/**
 * Generates dropdown options for minutes with 15-minute granularity
 * @returns Array of minute options
 */
export const generateMinuteOptions = (): Array<{ label: string; value: string }> => {
  const options: { label: string; value: string }[] = [];
  for (let i = 0; i < 60; i += 15) {
    const formatted = i.toString().padStart(2, '0');
    options.push({ label: formatted, value: i.toString() });
  }
  return options;
};

/**
 * Generates dropdown options for AM/PM
 * @param amLabel - Translated AM label
 * @param pmLabel - Translated PM label
 * @returns Array of AM/PM options
 */
export const generateAmPmOptions = (
  amLabel: string,
  pmLabel: string
): Array<{ label: string; value: string }> => {
  return [
    { label: amLabel, value: 'AM' },
    { label: pmLabel, value: 'PM' }
  ];
};
