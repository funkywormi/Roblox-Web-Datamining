import React, { useState } from "react";
import { useTranslation } from "react-utilities";

import { useGetWeeklyScreentimeQuery } from "../../../../apis/parentalControlsApi";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { dateTimes } from "../../../constants/screentimeConstants";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";
import { getScreentimeChartYAxis } from "../../../utils/parentalControls/screentime/screentimeChartAxis";

export const ScreentimeChart = ({ userId }: { userId: number }): JSX.Element => {
  const { data: screentimeData, isError } = useGetWeeklyScreentimeQuery(userId);
  const { translate } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Daily hours ordered by most recent first (index 0 === today).
  const dailyHours: number[] = Object.values(screentimeData?.dailyScreentimes ?? {})
    .sort((a, b) => a.daysAgo - b.daysAgo)
    .map(day => day.minutesPlayed / dateTimes.minutesPerHour);

  const restOfWeekLabels = screentimeUtils.getChartDayLabels(screentimeData?.localDayOfWeek ?? 1);
  const dayLabels = [
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.today),
    ...restOfWeekLabels,
  ];

  // The chart reads left-to-right from the oldest day to today.
  const hoursLeftToRight = dailyHours.toReversed();
  const labelsLeftToRight = dayLabels.toReversed();

  const dataMax = hoursLeftToRight.length ? Math.max(...hoursLeftToRight) : 0;
  const { max: axisMax, ticks } = getScreentimeChartYAxis(dataMax);

  const averageLabel = screentimeUtils.getAverageTimeLabel(dailyHours, translate);
  const averageDescription = translate(
    parentalControlsTranslationConstants.parentalControlsScreentime.averageDescription,
  );

  const getTooltipText = (hours: number): string =>
    screentimeUtils.getCompactFormattedTime(hours * dateTimes.minutesPerHour, translate);

  return (
    <div className="screentime-chart-container">
      {isError ? (
        <div className="screentime-error">
          {
            /* TODO ACCMAN-2493: Review error states and screentime copy */
            translate(parentalControlsTranslationConstants.parentalControlsScreentime.chartError)
          }
        </div>
      ) : (
        <React.Fragment>
          <div className="screentime-chart-header">
            <h3 className="screentime-chart-average text-heading-small content-emphasis">
              {averageLabel}
            </h3>
            <span className="text-label-medium content-muted">{averageDescription}</span>
          </div>
          <div className="screentime-chart">
            <div className="screentime-chart-plot">
              <div className="screentime-chart-bars">
                {labelsLeftToRight.map((label, index) => {
                  const hours = hoursLeftToRight[index] ?? 0;
                  const heightPercent = (hours / axisMax) * 100;
                  return (
                    <div key={label} className="screentime-chart-bar-column">
                      <button
                        type="button"
                        className="screentime-chart-bar-hitbox"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onFocus={() => setHoveredIndex(index)}
                        onBlur={() => setHoveredIndex(null)}
                        onClick={() => setHoveredIndex(index)}
                        aria-label={`${label}: ${getTooltipText(hours)}`}
                      >
                        {hoveredIndex === index && (
                          <div
                            className="screentime-chart-tooltip bg-surface-300 content-emphasis text-label-medium radius-small stroke-standard stroke-muted padding-x-small padding-y-xsmall"
                            style={{ bottom: `${heightPercent}%` }}
                          >
                            {getTooltipText(hours)}
                          </div>
                        )}
                        <div
                          className="screentime-chart-bar bg-system-emphasis"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="screentime-chart-yaxis">
                {ticks.map(tick => (
                  <span
                    key={tick}
                    className="screentime-chart-ylabel text-label-medium content-muted"
                    style={{ bottom: `${(tick / axisMax) * 100}%` }}
                  >
                    {screentimeUtils.getChartHourLabel(tick)}
                  </span>
                ))}
              </div>
            </div>
            <div className="screentime-chart-xlabels">
              {labelsLeftToRight.map(label => (
                <span
                  key={label}
                  className="screentime-chart-xlabel text-label-medium content-muted"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default ScreentimeChart;
