import { useState, useMemo, useEffect } from "react";
import { useUniversalFeatureRestrictionsConfig } from "../contexts/UniversalFeatureRestrictionsConfigContext";
import { formatCountdown } from "../shared/utils/formatCountdown";

function getEndDateTimestamp(endDateString?: string): number | undefined {
  if (!endDateString) {
    return undefined;
  }
  const timestamp = new Date(endDateString).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function getRemainingSeconds(endTimestamp: number): number {
  return Math.max((endTimestamp - Date.now()) / 1000, 0);
}

interface UseRestrictionEndDateInfoResult {
  formattedEndDate?: string;
  countdownText?: string;
}

/**
 * Returns a locale-formatted end date and a live countdown string that ticks every second.
 * Both values are undefined when the input date is missing or invalid.
 */
export const useRestrictionEndDateInfo = (
  endDateString?: string,
): UseRestrictionEndDateInfoResult => {
  const { translate, locale } = useUniversalFeatureRestrictionsConfig();
  const endTimestamp = getEndDateTimestamp(endDateString);

  const [countdownText, setCountdownText] = useState<string | undefined>(() => {
    if (!endTimestamp) {
      return undefined;
    }
    return formatCountdown(getRemainingSeconds(endTimestamp), translate);
  });

  const formattedEndDate = useMemo(() => {
    if (!endTimestamp) {
      return undefined;
    }
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(endTimestamp));
  }, [endTimestamp, locale]);

  useEffect(() => {
    if (!endTimestamp) {
      setCountdownText(undefined);
      return;
    }

    const tick = () => {
      const remaining = getRemainingSeconds(endTimestamp);
      setCountdownText(formatCountdown(remaining, translate));
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
  }, [endTimestamp, translate]);

  return { formattedEndDate, countdownText };
};
