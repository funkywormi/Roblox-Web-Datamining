import { PeriodType } from "@rbx/client-roblox-subscriptions-api/v1";

const lastDayOfMonth = (year: number, monthZeroBased: number): number => {
  return new Date(Date.UTC(year, monthZeroBased + 1, 0)).getUTCDate();
};

const addMonthsPreservingDom = (base: Date, months: number): Date => {
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth();
  const dom = base.getUTCDate();

  const targetMonth = month + months;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;

  const lastDay = lastDayOfMonth(targetYear, normalizedMonth);
  const targetDom = Math.min(dom, lastDay);

  return new Date(
    Date.UTC(
      targetYear,
      normalizedMonth,
      targetDom,
      base.getUTCHours(),
      base.getUTCMinutes(),
      base.getUTCSeconds(),
      base.getUTCMilliseconds(),
    ),
  );
};

const addYearsPreservingDom = (base: Date, years: number): Date => {
  const targetYear = base.getUTCFullYear() + years;
  const month = base.getUTCMonth();
  const dom = base.getUTCDate();

  const lastDay = lastDayOfMonth(targetYear, month);
  const targetDom = Math.min(dom, lastDay);

  return new Date(
    Date.UTC(
      targetYear,
      month,
      targetDom,
      base.getUTCHours(),
      base.getUTCMinutes(),
      base.getUTCSeconds(),
      base.getUTCMilliseconds(),
    ),
  );
};

export const addBillingPeriod = (
  baseTimestampMs: number,
  periodCount: number,
  periodType: PeriodType,
): Date => {
  const date = new Date(baseTimestampMs);

  switch (periodType) {
    case PeriodType.Week: {
      date.setUTCDate(date.getUTCDate() + 7 * periodCount);
      return date;
    }

    case PeriodType.Month:
      return addMonthsPreservingDom(date, periodCount);

    case PeriodType.Year:
      return addYearsPreservingDom(date, periodCount);

    default:
      throw new Error(`Unsupported period type: ${periodType as PeriodType}`);
  }
};

/**
 * Calculates the current period index (0-indexed) for a subscription.
 * Period 0 is from activation to first renewal, period 1 is after first renewal, etc.
 *
 * If nextRenewalTimestampMs is in the past, we subtract 1 from the calculated period
 * since the renewal is delayed, and we're still technically in the previous period.
 */
export const calculateCurrentPeriodIndex = (
  activationTimestampMs: number,
  periodType: PeriodType,
  nextRenewalTimestampMs: number | null,
  currentTimestampMs: number,
): number => {
  // Start from period 0 and increment until we find the current period
  let periodIndex = 0;

  // Find which period we're in by checking if current time is past the start of the next period
  while (periodIndex < 1000) {
    // Arbitrary large limit to prevent infinite loop
    const nextPeriodStartTimestampMs = addBillingPeriod(
      activationTimestampMs,
      periodIndex + 1,
      periodType,
    ).getTime();

    if (currentTimestampMs < nextPeriodStartTimestampMs) {
      // We're in this period
      break;
    }

    periodIndex += 1;
  }

  // Correction: if nextRenewalTimestampMs is in the past, we're actually in the previous period
  // because the renewal hasn't been processed yet
  if (nextRenewalTimestampMs && nextRenewalTimestampMs < currentTimestampMs && periodIndex > 0) {
    periodIndex -= 1;
  }

  return periodIndex;
};
