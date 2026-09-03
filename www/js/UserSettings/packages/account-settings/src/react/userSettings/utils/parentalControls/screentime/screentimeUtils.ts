import { Intl } from "Roblox";
import { TranslateFunction } from "react-utilities";
import { generateAllowedTimeAmountOptions, generateTimeLimitDisplay } from "@rbx/user-settings";
import { dateTimes } from "../../../constants/screentimeConstants";
import ContentMaturityLevel from "../../../../../enums/parentalControls/ContentMaturityLevel";
import { TContentMaturityRating } from "../../../../../types/gamesTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

const intl = Intl && new Intl();
const minutesPerHour = 60;
const minutesInDay = 1440;

const getCompactFormattedTime = (totalMinutes: number, translate: TranslateFunction): string => {
  const hours = Math.floor(totalMinutes / dateTimes.minutesPerHour);
  const minutes = Math.floor(totalMinutes % dateTimes.minutesPerHour);
  const { topGames } = parentalControlsTranslationConstants;
  if (hours === 0) {
    return translate(topGames.compactPlaytimeMinutes, { minutes });
  }
  return translate(topGames.compactPlaytimeHoursMinutes, { hours, minutes });
};

const getAverageTimeLabel = (daysArray: number[], translate: TranslateFunction): string => {
  const totalMinutesPlayed = daysArray.reduce(
    (total, hours) => total + hours * dateTimes.minutesPerHour,
    0,
  );
  const averageDailyMinutes = totalMinutesPlayed / daysArray.length;

  return getCompactFormattedTime(averageDailyMinutes, translate);
};

// Localized whole-hour label for the screentime chart's y-axis (e.g. "2h")
const getChartHourLabel = (hours: number): string => {
  if (hours === 0) {
    return new globalThis.Intl.NumberFormat().format(0);
  }
  return new globalThis.Intl.NumberFormat(undefined, {
    style: "unit",
    unit: "hour",
    unitDisplay: "narrow",
  }).format(hours);
};

const getChartDayLabels = (currentDay: number): string[] => {
  const weekdaysList = intl.getWeekdaysList("short");
  const categories: string[] = [];

  for (let i = 1; i < dateTimes.daysPerWeek; i++) {
    const dayIndex = (currentDay - 1 - i + dateTimes.daysPerWeek) % dateTimes.daysPerWeek;
    categories.push(weekdaysList[dayIndex]?.name ?? "");
  }

  return categories;
};

const generatePlaytimeString = (
  screenTimeTranslation: string,
  hoursTranslation: string,
  hourTranslation: string,
  minutesTranslation: string,
  minuteTranslation: string,
  totalMinutes: number,
): string => {
  const hours = Math.floor(totalMinutes / minutesPerHour);
  const minutes = totalMinutes % minutesPerHour;
  let timeString = "";

  if (hours > 0) {
    timeString += `${hours} ${hours > 1 ? hoursTranslation : hourTranslation}`;
  }

  if (minutes > 0 || hours === 0) {
    if (timeString) {
      timeString += " ";
    }
    timeString += `${minutes} ${minutes > 1 ? minutesTranslation : minuteTranslation}`;
  }

  return `${screenTimeTranslation} ${timeString}`;
};

const generateRatingDisplay = (
  maturityTranslation: string,
  unratedTranslation: string,
  maturityRating?: string,
): string => {
  return `${maturityTranslation} ${maturityRating || unratedTranslation}`;
};

// Maps age-recommendation api response for maturity level to ContentMaturityLevel enum
const CONTENT_MATURITY_LEVEL_BY_RATING: Record<
  TContentMaturityRating,
  ContentMaturityLevel | undefined
> = {
  minimal: ContentMaturityLevel.Minimal,
  mild: ContentMaturityLevel.Mild,
  moderate: ContentMaturityLevel.Moderate,
  restricted: ContentMaturityLevel.Restricted,
  unrated: undefined,
};

const contentMaturityToLevel = (
  rating?: TContentMaturityRating,
): ContentMaturityLevel | undefined =>
  rating ? CONTENT_MATURITY_LEVEL_BY_RATING[rating] : undefined;

// Combines genre + subgenre into a single display label, e.g. "Puzzle • Word"
const getGenreLabel = (game: { genre_l1?: string; genre_l2?: string }): string =>
  [game.genre_l1, game.genre_l2].filter(Boolean).join(" • ");

/**
 * Returns a short label for the rolling 7-day screentime window that ends
 * today. `Intl.DateTimeFormat.prototype.formatRange` handles the locale-correct
 * separator, component order, and the same-month-vs.-cross-month collapse for
 * us (e.g. en-US "Feb 8 – 14", es "8–14 feb", ja "2月8日～14日").
 */
const getPastWeekDateRangeLabel = (now: Date = new Date()): string => {
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(end.getDate() - 6);
  return new globalThis.Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).formatRange(start, end);
};

const screentimeUtils = {
  getCompactFormattedTime,
  getAverageTimeLabel,
  getChartHourLabel,
  getChartDayLabels,
  generateAllowedTimeAmountOptions,
  generateCurrentTimeDisplay: generateTimeLimitDisplay,
  generatePlaytimeString,
  generateRatingDisplay,
  contentMaturityToLevel,
  getGenreLabel,
  getPastWeekDateRangeLabel,
  minutesInDay,
};

export default screentimeUtils;
