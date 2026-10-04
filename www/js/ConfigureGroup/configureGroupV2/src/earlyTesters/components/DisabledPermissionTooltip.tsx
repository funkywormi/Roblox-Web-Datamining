import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';
import { Tooltip, TooltipTrigger } from '@rbx/foundation-ui';

export type DisabledPermissionTooltipProps = {
  isDisabled: boolean;
  title: string;
  children: ReactNode;
  className?: string;
};

const DisabledPermissionTooltip: FunctionComponent<DisabledPermissionTooltipProps> = ({
  isDisabled,
  title,
  children,
  className = 'block width-full cursor-not-allowed',
}) => {
  if (!isDisabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip position='top-center' title={title}>
      <TooltipTrigger asChild>
        <span className={className} aria-label={title}>
          {children}
        </span>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default DisabledPermissionTooltip;
