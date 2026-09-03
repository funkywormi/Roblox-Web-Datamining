import { useTranslation } from "@rbx/core-scripts/react";
import { AccountStandingStatus } from "../../types/api";
import { STATUS_LEVELS } from "./statusLevels";

export const EMPTY_SEGMENT_CLASS = "bg-shift-300";

type StatusProgressBarProps =
  | {
      /**
       * Lights up every segment with the full color spectrum, ignoring an
       * individual account's status. Used as an explanatory legend.
       */
      fullSpectrum: true;
      empty?: undefined;
      status?: undefined;
    }
  | {
      /**
       * Renders all segments greyed-out with nothing filled. Used when there's
       * no status to show, e.g. when the account-standing request fails.
       */
      empty: true;
      fullSpectrum?: undefined;
      status?: undefined;
    }
  | {
      fullSpectrum?: false;
      empty?: false;
      status: AccountStandingStatus;
    };

/**
 * A custom 4-segment progress bar showing account standing.
 * Segments fill from left to right: "All good" = all 4 filled green,
 * "Fair" = 3 filled, "At risk" = 2 filled, "Critical" = 1 filled.
 *
 * Unfilled segments are greyed out. Callers hide the bar entirely for banned
 * accounts (a platform `Ban` intervention), which sit off this scale.
 *
 * When `fullSpectrum` is set, every segment is lit up with the full color
 * spectrum instead, serving as an explanatory legend. When `empty` is set,
 * every segment is greyed out with nothing filled.
 */
const StatusProgressBar = ({ empty, fullSpectrum, status }: StatusProgressBarProps) => {
  const { translate } = useTranslation();

  let segmentColorClasses: string[] = [];
  if (empty) {
    segmentColorClasses = STATUS_LEVELS.map(() => EMPTY_SEGMENT_CLASS);
  } else if (fullSpectrum) {
    segmentColorClasses = STATUS_LEVELS.map(level => level.colorClass);
  } else {
    const statusIndex = STATUS_LEVELS.findIndex(level => level.status === status);
    const colorClass = STATUS_LEVELS[statusIndex]?.colorClass ?? EMPTY_SEGMENT_CLASS;

    segmentColorClasses = STATUS_LEVELS.map((_, i) =>
      i <= statusIndex ? colorClass : EMPTY_SEGMENT_CLASS,
    );
  }

  return (
    <div data-testid="status-progress-bar" className="flex flex-col gap-xsmall width-full">
      <div className="flex gap-xxsmall">
        {STATUS_LEVELS.map((level, i) => {
          const isFirst = i === 0;
          const isLast = i === STATUS_LEVELS.length - 1;

          const colorClass = segmentColorClasses[i];
          const borderRadius = isFirst
            ? "var(--radius-small) 0 0 var(--radius-small)"
            : isLast
              ? "0 var(--radius-small) var(--radius-small) 0"
              : undefined;

          return (
            <div
              key={level.status}
              className={`grow-1 height-[8px] ${colorClass}`}
              style={borderRadius ? { borderRadius } : undefined}
              data-testid={`progress-segment-${i}`}
            />
          );
        })}
      </div>

      <div className="flex justify-between">
        <span className="text-caption-medium content-muted">{translate("Label.Banned")}</span>
        <span className="text-caption-medium content-muted">{translate("Label.AllGood")}</span>
      </div>
    </div>
  );
};

export default StatusProgressBar;
