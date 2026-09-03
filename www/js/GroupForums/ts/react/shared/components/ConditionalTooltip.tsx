import React from 'react';
import { Tooltip, TooltipTrigger, TTooltipProps } from '@rbx/foundation-ui';

type ConditionalTooltipProps = {
  id: string;
  content?: string;
  position: TTooltipProps['position'];
  containerClassName?: string;
  children: React.ReactNode;
  enabled: boolean;
};

const ConditionalTooltip = ({
  position,
  content,
  children,
  id,
  containerClassName,
  enabled
}: ConditionalTooltipProps): JSX.Element => {
  return enabled ? (
    <Tooltip position={position} title={content ?? ''}>
      <TooltipTrigger asChild>
        <div id={id} className={containerClassName}>
          {children}
        </div>
      </TooltipTrigger>
    </Tooltip>
  ) : (
    <div className={containerClassName}>{children}</div>
  );
};

ConditionalTooltip.defaultProps = {
  containerClassName: undefined
};

export default ConditionalTooltip;
