import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { abbreviateNumber } from 'core-utilities';
import { abbreviateNumberWithTruncateLength } from '../utils/abbreviateNumbers';

export type AnimatedAbbreviatedCountProps = {
  value: number;
  className?: string;
  variant: 'reaction' | 'reply';
};

type AnimatedAbbreviatedValueProps = {
  tick: number;
  text: string;
  className?: string;
};

const AnimatedAbbreviatedValue = ({
  tick,
  text,
  className
}: AnimatedAbbreviatedValueProps): JSX.Element => (
  <span
    key={tick}
    className={classNames(
      'groups-animated-abbrev-count__value',
      {
        'groups-animated-abbrev-count__value--changed': tick > 0
      },
      className
    )}>
    {text}
  </span>
);

const AnimatedAbbreviatedCount = ({
  value,
  className,
  variant
}: AnimatedAbbreviatedCountProps): JSX.Element => {
  const [tick, setTick] = useState(0);
  const prevValue = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (prevValue.current === null) {
      prevValue.current = value;
      return;
    }
    if (prevValue.current !== value) {
      prevValue.current = value;
      setTick(t => t + 1);
    }
  }, [value]);

  const text =
    variant === 'reaction'
      ? abbreviateNumberWithTruncateLength(value)
      : abbreviateNumber.getAbbreviatedValue(value);

  const valueEl = (
    <AnimatedAbbreviatedValue
      tick={tick}
      text={text}
      className={variant === 'reply' ? className : undefined}
    />
  );

  if (variant === 'reaction') {
    return <span className={classNames('groups-animated-abbrev-count', className)}>{valueEl}</span>;
  }

  return valueEl;
};

export default AnimatedAbbreviatedCount;
