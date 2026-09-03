import React from 'react';
import type { GroupAnalyticsCardDefinition } from '../groupAnalyticsDefinitions';
import { GroupAnalyticsMetricDisplay } from './GroupAnalyticsMetricDisplay';

export type GroupAnalyticsCardProps = {
  title?: string;
  metrics: GroupAnalyticsCardDefinition[];
};

const GroupAnalyticsCard: React.FC<GroupAnalyticsCardProps> = ({ title, metrics }) => {
  const isStacked = Boolean(title) || metrics.length > 1;
  let cardSpacingClass = '';
  if (title) {
    cardSpacingClass = ' gap-xxlarge';
  } else if (isStacked) {
    cardSpacingClass = ' gap-xlarge';
  }
  const metricDisplays = isStacked
    ? metrics.map(metric => (
        <div key={metric.id} className='flex flex-col'>
          <GroupAnalyticsMetricDisplay card={metric} />
        </div>
      ))
    : metrics.map(metric => <GroupAnalyticsMetricDisplay key={metric.id} card={metric} />);

  return (
    <div className={`group-analytics-card${cardSpacingClass}`}>
      {title && <h2 className='margin-none text-heading-small'>{title}</h2>}
      {title ? <div className='flex flex-col gap-xlarge'>{metricDisplays}</div> : metricDisplays}
    </div>
  );
};

export default GroupAnalyticsCard;
