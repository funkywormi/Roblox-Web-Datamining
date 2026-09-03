import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';
import { clsx } from '@rbx/foundation-ui';

export type StatePanelProps = {
  illustration?: ReactNode;
  title: ReactNode;
  titleClassName?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  testId?: string;
};

/** Centered pictogram + heading + optional body + optional action, shared by EmptyState and ErrorState. */
const StatePanel: FunctionComponent<StatePanelProps> = ({
  illustration,
  title,
  titleClassName = 'text-heading-small',
  description,
  action,
  className,
  testId,
}) => (
  <div
    className={clsx(
      'flex flex-col justify-center items-center text-align-x-center padding-large gap-medium width-full min-height-[60vh]',
      className,
    )}
    data-testid={testId}>
    {illustration}
    <div className='flex flex-col text-align-x-center gap-small'>
      <h2 className={clsx('content-emphasis margin-none', titleClassName)}>{title}</h2>
      {description && <span className='text-body-medium content-default'>{description}</span>}
    </div>
    {action}
  </div>
);

export default StatePanel;
