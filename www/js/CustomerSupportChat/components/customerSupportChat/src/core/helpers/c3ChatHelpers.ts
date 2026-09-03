import { Intl } from "@rbx/core-scripts/legacy/Roblox";
/**
 * @returns The current (new Date()) formatted timestamp string, ie. "Jan 01, 2021 | 12:00 AM"
 */
export const chatTimestamp = (): string => {
  const intl = new Intl();
  const nowTimestamp = new Date();
  const dateTimeFormatter = intl.getDateTimeFormatter();
  const dateTime = dateTimeFormatter.getCustomDateTime(nowTimestamp, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const hourTime = dateTimeFormatter.getCustomDateTime(nowTimestamp, {
    hour: "numeric",
    minute: "numeric",
  });

  return `${dateTime} | ${hourTime}`;
};
