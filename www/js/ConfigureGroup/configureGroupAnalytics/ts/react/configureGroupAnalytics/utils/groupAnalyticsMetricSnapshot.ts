import { QueryResponse } from '@rbx/client-analytics-query-gateway/v1';
import { GROUP_ANALYTICS_METRIC_START_DATE, ChartSummaryType } from '../groupAnalyticsDefinitions';

/**
 * Aggregated values for the analytics chart summary: current-period total, optional
 * prior-period total when history fully covers the comparison window, and derived
 * comparison fields (relative change ratio and whether the metric moved up).
 */
export type GroupAnalyticsMetricSnapshot = {
  currentTotal: number;
  comparisonTotal?: number;
  ratio?: number;
  isUp?: boolean;
  currentWindow: {
    start: Date;
    end: Date;
  };
  comparisonWindow: {
    start: Date;
    end: Date;
  };
};

function parseDataPointTime(time: string | undefined): number | undefined {
  if (!time) {
    return undefined;
  }
  const ms = new Date(time).getTime();
  return Number.isNaN(ms) ? undefined : ms;
}

function queryResponseToDataPoints(response: QueryResponse): [number, number][] {
  const values = response?.operation?.queryResult?.values;
  if (!values) {
    return [];
  }
  const allPoints: [number, number][] = [];
  for (const value of values) {
    for (const dataPoint of value.dataPoints ?? []) {
      const ms = parseDataPointTime(dataPoint.time);
      if (ms !== undefined) {
        allPoints.push([ms, dataPoint.value ?? 0]);
      }
    }
  }
  allPoints.sort((a, b) => a[0] - b[0]);
  return allPoints;
}

/**
 * Inclusive interval `[windowStart, windowEnd]` on timestamps — matches Creator Hub
 * `sliceRAQIV2QueryResultByTimeRange` (`dataPointTimestamp >= start && dataPointTimestamp <= end`).
 * Window `end` is the last daily bucket (UTC midnight) to include in the total.
 */
function sliceDataPointsToWindow(
  points: [number, number][],
  windowStart: Date,
  windowEndInclusive: Date
): [number, number][] {
  const startMs = windowStart.getTime();
  const endMs = windowEndInclusive.getTime();
  return points.filter(([ms]) => ms >= startMs && ms <= endMs);
}

/** Matches Creator Hub `getSummarizeValueForSingleSeries` for Total and LastValue. */
function getTotalInWindow(
  summaryType: ChartSummaryType,
  window: { start: Date; end: Date },
  allPoints: [number, number][]
): number {
  const inWindow = sliceDataPointsToWindow(allPoints, window.start, window.end);

  if (inWindow.length === 0) {
    return 0;
  }

  if (summaryType === ChartSummaryType.LastValue) {
    return inWindow[inWindow.length - 1][1];
  }

  const total = inWindow.reduce((sum, [, v]) => sum + (v ?? 0), 0);
  return total;
}

/**
 * Derives a GroupAnalyticsMetricSnapshot from a gateway `QueryResponse` by flattening series into
 * timestamped points, slicing each **inclusive** daily window, and aggregating per `summaryType`
 * like `genericRAQIV2ChartSummaryAdapter.getSummarizeValueForSingleSeries`.
 *
 * Window `end` is the **last included** UTC midnight for daily granularity (see `dateRange`).
 *
 * When the comparison window starts before {@link GROUP_ANALYTICS_METRIC_START_DATE},
 * `comparisonTotal` (and ratio / direction) is omitted.
 */
export function getGroupAnalyticsMetricSnapshot(
  summaryType: ChartSummaryType,
  response: QueryResponse,
  currentWindow: { start: Date; end: Date },
  comparisonWindow: { start: Date; end: Date }
): GroupAnalyticsMetricSnapshot {
  const allPoints = queryResponseToDataPoints(response);

  const currentTotal = getTotalInWindow(summaryType, currentWindow, allPoints);

  const comparisonWindowHasFullMetricCoverage =
    comparisonWindow.start.getTime() >= GROUP_ANALYTICS_METRIC_START_DATE.getTime();

  const comparisonTotal = comparisonWindowHasFullMetricCoverage
    ? getTotalInWindow(summaryType, comparisonWindow, allPoints)
    : undefined;

  const ratio =
    comparisonTotal !== undefined && comparisonTotal !== 0
      ? Math.abs((currentTotal - comparisonTotal) / comparisonTotal)
      : undefined;

  const isUp = comparisonTotal !== undefined ? currentTotal > comparisonTotal : undefined;

  return {
    currentTotal,
    comparisonTotal,
    ratio,
    isUp,
    currentWindow,
    comparisonWindow
  };
}
