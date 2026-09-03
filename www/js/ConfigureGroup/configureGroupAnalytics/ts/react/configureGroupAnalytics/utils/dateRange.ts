/**
 * Daily granularity constants aligned with Creator Hub `millisecondsInInterval(OneDay)` /
 * `snapToLatestTimestep` (epoch-aligned UTC day buckets).
 */
const MILLIS_PER_DAY = 86_400_000;

/**
 * Snap to UTC midnight for the calendar day containing `date`, using epoch alignment — same
 * idea as Creator Hub OneDay `snapToLatest` (86400000 ms buckets).
 */
export function snapToUtcDayStart(date: Date): Date {
  const ms = date.getTime();
  return new Date(ms - (ms % MILLIS_PER_DAY));
}

/** Same as Creator Hub `calculateDatesFromRangeType` + `subDays(endDate, n)` — calendar math in UTC. */
function subDaysUtc(date: Date, amount: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() - amount);
  return d;
}

/**
 * When `maxEndDate` snaps to **today’s** UTC midnight, daily metrics should only include **complete**
 * prior UTC days (Creator Hub / “latest available” semantics). Otherwise `snapToUtcDayStart(now)` and
 * metadata that lands on “today” shift the whole window forward by one day vs Creator Hub.
 */
function clipToLastCompleteUtcDayIfSnappedEndIsToday(snappedEndUtc: Date): Date {
  const todayStartUtc = snapToUtcDayStart(new Date());
  if (snappedEndUtc.getTime() === todayStartUtc.getTime()) {
    return subDaysUtc(snappedEndUtc, 1);
  }
  return snappedEndUtc;
}

/**
 * Daily windows for `MetricGranularity.OneDay` with **inclusive** UTC midnight buckets (same
 * semantics as `sliceDataPointsToWindow` / `<= endTimestamp` on daily points).
 *
 * **`segmentDays`** is the number of **calendar days** in the current period (e.g. “Last 7 days”
 * = seven inclusive day buckets). Because both `start` and `end` label the first/last included
 * bucket, the current period start is `subDays(end, segmentDays - 1)` (not `subDays(end, n)`,
 * which would span `n + 1` inclusive days).
 *
 * **Comparison period**: `duration = currentEnd - currentStart`; `comparisonEndInclusive` is the
 * UTC day before `currentStart`; `comparisonStart` backs up by the same `duration` so the prior
 * span has the same inclusive length as the current span.
 *
 * Snapping / clipping the current end to the last **complete** UTC day when the caller’s end is
 * “today” follows Creator Hub “latest available daily” behavior.
 */
export function getCurrentAndComparisonWindows(
  segmentDays: number,
  maxEndDate: Date
): {
  currentWindow: { start: Date; end: Date };
  comparisonWindow: { start: Date; end: Date };
  fetchStart: Date;
  fetchEnd: Date;
} {
  const snappedEnd = snapToUtcDayStart(maxEndDate);
  const currentEndInclusive = clipToLastCompleteUtcDayIfSnappedEndIsToday(snappedEnd);

  const daySpan = Math.max(0, segmentDays - 1);
  const startDate = subDaysUtc(currentEndInclusive, daySpan);
  const currentStart = snapToUtcDayStart(startDate);

  const duration = currentEndInclusive.getTime() - currentStart.getTime();

  const comparisonEndInclusive = new Date(currentStart.getTime() - MILLIS_PER_DAY);
  const comparisonStart = new Date(comparisonEndInclusive.getTime() - duration);

  return {
    currentWindow: { start: currentStart, end: currentEndInclusive },
    comparisonWindow: { start: comparisonStart, end: comparisonEndInclusive },
    fetchStart: comparisonStart,
    fetchEnd: currentEndInclusive
  };
}
