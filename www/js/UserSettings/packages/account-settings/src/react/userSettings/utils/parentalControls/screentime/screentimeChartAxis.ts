/**
 * Computes the screentime chart's y-axis max and tick positions.
 *
 * Labels are always whole hours: we pick the smallest "nice" whole-hour
 * interval that covers the (padded) data max within `MAX_TICKS` labels, then
 * emit ticks from 0 up to `max` in that interval. The top tick equals `max`,
 * so the highest label sits at the top of the plot and bar heights scale
 * cleanly against `max`.
 */

export type ScreentimeChartYAxis = {
  /** The value at the top of the plot area; bar heights are scaled against it. */
  max: number;
  /** Tick values (in whole hours) rendered as y-axis labels, ascending. */
  ticks: number[];
};

// Headroom (5%) added above the data max so the tallest bar doesn't butt
// against the top of the plot.
const MAX_PADDING = 0.05;
const MAX_TICKS = 4;
const NICE_HOUR_INTERVALS = [1, 2, 3, 5, 10, 15, 20, 30, 50, 100];

export const getScreentimeChartYAxis = (dataMax: number): ScreentimeChartYAxis => {
  if (dataMax <= 0) {
    return { max: 2, ticks: [0, 1, 2] };
  }

  const paddedMax = dataMax * (1 + MAX_PADDING);

  const interval =
    NICE_HOUR_INTERVALS.find(candidate => Math.ceil(paddedMax / candidate) + 1 <= MAX_TICKS) ??
    Math.ceil(paddedMax / (MAX_TICKS - 1));

  const max = Math.ceil(paddedMax / interval) * interval;

  const ticks: number[] = [];
  for (let tick = 0; tick <= max; tick += interval) {
    ticks.push(tick);
  }

  return { max, ticks };
};

export default getScreentimeChartYAxis;
