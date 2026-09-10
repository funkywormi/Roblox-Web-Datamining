import type { TranslateFn } from "../../types/hostConfig";

const ONE_MINUTE_IN_SECONDS = 60;
const ONE_HOUR_IN_SECONDS = 3600;
const ONE_DAY_IN_SECONDS = 86400;

/**
 * Converts remaining seconds into a translated countdown string.
 * Returns a days-based string for durations >= 1 day, or an HH:MM-based string otherwise.
 * Rounds up to the nearest minute. Returns undefined when time has expired.
 */
export function formatCountdown(
  timeRemainingSecs: number,
  translate: TranslateFn,
): string | undefined {
  if (timeRemainingSecs <= 0) {
    return undefined;
  }

  const roundedUpMinutes = Math.ceil(timeRemainingSecs / ONE_MINUTE_IN_SECONDS);
  const totalSeconds = roundedUpMinutes * ONE_MINUTE_IN_SECONDS;

  if (totalSeconds >= ONE_DAY_IN_SECONDS) {
    const days = Math.ceil(totalSeconds / ONE_DAY_IN_SECONDS);
    if (days === 1) {
      return translate("Label.TimeLeft.Day.Singular");
    }
    return translate("Label.TimeLeft.Day.Plural", { number: String(days) });
  }

  const hours = Math.floor(totalSeconds / ONE_HOUR_IN_SECONDS);
  const minutes = Math.floor((totalSeconds % ONE_HOUR_IN_SECONDS) / ONE_MINUTE_IN_SECONDS);
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return translate("Label.TimeLeft.Hours", { time: `${hh}:${mm}` });
}
