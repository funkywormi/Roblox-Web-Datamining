import React from 'react';
import { ProgressCircle, TProgressCircleProps } from '@rbx/foundation-ui';
import classNames from 'classnames';

export type InlineProgressLoaderProps = {
  className?: string;
  textClassNames?: [string];
  text?: string;
} & TProgressCircleProps;

const InlineProgressLoader: React.FC<InlineProgressLoaderProps> = ({
  textClassNames = ['text-body-large'],
  className,
  text,
  ...progressLoaderProps
}) => {
  return (
    <div className={classNames('inline-progress-loader-container', className)}>
      <ProgressCircle {...progressLoaderProps} />
      {text && (
        <span className={classNames('inline-progress-loader-text', ...textClassNames)}>{text}</span>
      )}
    </div>
  );
};

InlineProgressLoader.displayName = 'InlineProgressLoader';

export default InlineProgressLoader;
