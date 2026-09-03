import type { TranslateFunction } from "../providers/types";

const MS_PER_MINUTE = 1000 * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

/**
 * Given the end date of a suspension, returns the time left in the suspension.
 * The time is returned either in the form of "X days" or "X:XX hours".
 *
 * Ex: 5 days
 * Ex: 1:04 hours
 */
const getTimeLeftInSuspension = (endDateString: string, translate: TranslateFunction): string => {
  const endDate = new Date(endDateString);
  const now = Date.now();

  // If the end date is not valid, return 00:00 hours.
  if (Number.isNaN(endDate.getTime())) {
    return translate("Label.Hours", {
      hours: "00",
      minutes: "00",
    });
  }

  let diffMs = endDate.getTime() - now;

  // If the end date is already in the past, set the diff to 0.
  if (diffMs < 0) {
    diffMs = 0;
  }

  // If the time left is more than a day, return the number of days left.
  if (diffMs > MS_PER_DAY) {
    const daysLeft = Math.ceil(diffMs / MS_PER_DAY);
    return translate("Label.Days", { number: String(daysLeft) });
  }

  const hoursLeft = Math.floor(diffMs / MS_PER_HOUR);
  let minutesLeft = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);

  // If the total time left is in between 0 and 1 minute, set to 1 minute to prevent showing 00:00 hours.
  if (diffMs > 0 && diffMs < MS_PER_MINUTE) {
    minutesLeft = 1;
  }

  return translate("Label.Hours", {
    hours: hoursLeft.toString().padStart(2, "0"),
    minutes: minutesLeft.toString().padStart(2, "0"),
  });
};

export default getTimeLeftInSuspension;
