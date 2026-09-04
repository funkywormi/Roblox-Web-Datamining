import React, { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';

const LeftRightLayout = ({
  left,
  right,
  className,
  style,
  leftClassName,
  rightClassName
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  style?: CSSProperties;
  leftClassName?: string;
  rightClassName?: string;
}): JSX.Element => (
  <div className={classNames('flex', className)} style={style}>
    <div
      className={classNames(
        'grow basis-0',
        'large:min-width-[calc(var(--breakpoint-medium)/2)] max-width-[calc(var(--breakpoint-medium)/2)]',
        'xlarge:max-width-[calc(var(--breakpoint-xlarge)/3)]',
        leftClassName
      )}>
      {left}
    </div>
    <div className={classNames('hidden large:block grow-2 shrink-0 basis-0', rightClassName)}>
      {right}
    </div>
  </div>
);

export default LeftRightLayout;
