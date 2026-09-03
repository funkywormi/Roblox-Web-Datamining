import React from 'react';
import { Chip, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import type { GroupAnalyticsMetricSnapshot } from '../utils/groupAnalyticsMetricSnapshot';

export type GroupAnalyticsCardChipProps = {
  snapshot: GroupAnalyticsMetricSnapshot | undefined;
};

// Caps % in comparison chip to 1,000%
const MAX_COMPARISON_CHIP_RATIO = 10;

const percentChipFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

function formatUtcPeriodLabel(start: Date, end: Date, fmt: Intl.DateTimeFormat): string {
  return start.getTime() === end.getTime()
    ? fmt.format(start)
    : `${fmt.format(start)} - ${fmt.format(end)}`;
}

function comparisonChipTooltipText(
  snapshot: GroupAnalyticsMetricSnapshot,
  translate: (key: string, params?: Record<string, unknown>) => string
): string {
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
  const { currentWindow, comparisonWindow } = snapshot;
  return translate('Tooltip.PeriodComparison', {
    currentPeriod: formatUtcPeriodLabel(currentWindow.start, currentWindow.end, fmt),
    previousPeriod: formatUtcPeriodLabel(comparisonWindow.start, comparisonWindow.end, fmt)
  });
}

function comparisonChipText(ratio: number, isUp: boolean): string {
  const arrow = isUp ? '\u2191' : '\u2193';
  const magnitude =
    ratio > MAX_COMPARISON_CHIP_RATIO ? '>1,000%' : percentChipFormatter.format(ratio);
  return `${arrow} ${magnitude}`;
}

export const GroupAnalyticsCardChip: React.FC<GroupAnalyticsCardChipProps> = ({ snapshot }) => {
  const { translate } = useTranslation();

  if (snapshot === undefined) {
    return null;
  }

  const { ratio, isUp } = snapshot;
  if (ratio === undefined || isUp === undefined) {
    return null;
  }

  const className = isUp
    ? 'group-analytics-card-trend-chip-good'
    : 'group-analytics-card-trend-chip-bad';
  const text = comparisonChipText(ratio, isUp);
  const tooltipText = comparisonChipTooltipText(snapshot, translate);
  return (
    <Tooltip position='top-start' title={tooltipText}>
      <TooltipTrigger asChild>
        <Chip text={text} isChecked={false} className={className} />
      </TooltipTrigger>
    </Tooltip>
  );
};
