import React from 'react';
import { Loading } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import type { GroupAnalyticsCardDefinition } from '../groupAnalyticsDefinitions';
import { useGroupAnalytics } from '../contexts/GroupAnalyticsContext';
import { GroupAnalyticsCardChip } from './GroupAnalyticsCardChip';

export function formatSummaryValue(value: number): string {
  const numberFormatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  return new Intl.NumberFormat(undefined, numberFormatOptions).format(value);
}

export type GroupAnalyticsMetricDisplayProps = {
  card: GroupAnalyticsCardDefinition;
};

export const GroupAnalyticsMetricDisplay: React.FC<GroupAnalyticsMetricDisplayProps> = ({
  card
}) => {
  const { translate } = useTranslation();
  const { getCardMetricQuery, isMetricMetadataLoading } = useGroupAnalytics();
  const { isLoading, isError, data } = getCardMetricQuery(card);
  const valueDisplay = !isError && data ? formatSummaryValue(data.currentTotal) : '-';

  return (
    <React.Fragment>
      <h3 className='group-analytics-card-title'>{translate(card.titleKey)}</h3>
      {isMetricMetadataLoading || isLoading ? (
        <Loading />
      ) : (
        <div className='group-analytics-card-footer'>
          <div className='group-analytics-card-value'>{valueDisplay}</div>
          <GroupAnalyticsCardChip snapshot={data} />
        </div>
      )}
    </React.Fragment>
  );
};
