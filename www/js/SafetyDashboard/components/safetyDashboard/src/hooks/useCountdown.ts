import { useState, useEffect } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import type { TranslateFunction } from "@rbx/core-scripts/react";

const ONE_MINUTE_IN_SECONDS = 60;
const ONE_HOUR_IN_SECONDS = 3600;
const ONE_DAY_IN_SECONDS = 86400;

function getRemainingSeconds(endTimestamp: number): number {
  return Math.max((endTimestamp - Date.now()) / 1000, 0);
}

/**
 * Formats the countdown text for a given time remaining, based on the number of seconds left.
 * Uses translation keys to render days (singular/plural) or hours:minutes as appropriate.
 */
function formatCountdownText(remainingSeconds: number, translate: TranslateFunction): string {
  if (remainingSeconds <= 0) {
    return translate("Label.Complete");
  }

  const roundedUpMinutes = Math.ceil(remainingSeconds / ONE_MINUTE_IN_SECONDS);
  const totalSeconds = roundedUpMinutes * ONE_MINUTE_IN_SECONDS;

  if (totalSeconds >= ONE_DAY_IN_SECONDS) {
    const days = Math.ceil(totalSeconds / ONE_DAY_IN_SECONDS);
    return days === 1
      ? translate("Label.TimeLeft.Day.Singular")
      : translate("Label.TimeLeft.Day.Plural", { number: days });
  }

  const hours = Math.floor(totalSeconds / ONE_HOUR_IN_SECONDS);
  const minutes = Math.floor((totalSeconds % ONE_HOUR_IN_SECONDS) / ONE_MINUTE_IN_SECONDS);
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return translate("Label.TimeLeft.Hours", { time: `${hh}:${mm}` });
}

/**
 * Accepts an endDate ISO string and returns a live countdown text and expiry status.
 * Uses setInterval to tick every second.
 */
const useCountdown = (endDate: string) => {
  const { translate } = useTranslation();
  const endTimestamp = new Date(endDate).getTime();

  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    return !endDate || Number.isNaN(endTimestamp) ? 0 : getRemainingSeconds(endTimestamp);
  });

  useEffect(() => {
    if (Number.isNaN(endTimestamp)) {
      return;
    }

    const tick = () => {
      const remaining = getRemainingSeconds(endTimestamp);
      setRemainingSeconds(remaining);
      return remaining;
    };

    if (tick() <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      if (tick() <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [endTimestamp]);

  const isExpired = remainingSeconds <= 0;
  const countdownText = formatCountdownText(remainingSeconds, translate);

  return { countdownText, isExpired };
};

export default useCountdown;
