import React, { FunctionComponent } from 'react';
import { Icon, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';

interface O18BoostBadgeProps {
  label: string;
  tooltipTitle: string;
  tooltipDescription: string;
  tooltipContentClassName?: string;
}

const O18BoostBadge: FunctionComponent<O18BoostBadgeProps> = ({
  label,
  tooltipTitle,
  tooltipDescription,
  tooltipContentClassName
}) => (
  <div className='o18-boost-badge'>
    <span className='o18-boost-badge-label'>{label}</span>
    <Tooltip
      position='top-center'
      title={tooltipTitle}
      description={tooltipDescription}
      contentClassName={tooltipContentClassName}>
      <TooltipTrigger asChild>
        <Icon
          name='icon-regular-circle-i'
          size='XSmall'
          role='button'
          tabIndex={0}
          aria-label={label}
        />
      </TooltipTrigger>
    </Tooltip>
  </div>
);

export default O18BoostBadge;
