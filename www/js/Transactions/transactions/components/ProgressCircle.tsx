import clsx from 'clsx';
import React, { ComponentPropsWithRef } from 'react';
import type { TTailwindTextCaptionClass } from '@rbx/foundation-tailwind/classes';
import './ProgressCircle.css';
import './internal/Common.css';

export const progressCircleSizes = ['Small', 'Medium', 'Large'] as const;
export type TProgressCircleSize = (typeof progressCircleSizes)[number];

export const progressCircleVariants = ['Determinate', 'Indeterminate'] as const;
export type TProgressCircleVariant = (typeof progressCircleVariants)[number];

export type TProgressCircleProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuenow'
> & {
  /** The size of the progress circle. */
  size?: TProgressCircleSize;
  /** The variant of the progress circle. */
  variant?: TProgressCircleVariant;
  /** The progress value (0-100). Only applicable for 'Determinate' variant. */
  value?: number;
  /** Whether to show the percentage value inside the circle. Only applicable for 'Determinate' variant. */
  showValue?: boolean;
  /** Accessible label for screen readers. */
  ariaLabel: string;
};

type SizeConfig = {
  dimension: number;
  strokeWidth: number;
  textClass: TTailwindTextCaptionClass;
  /** Extra padding when showing value */
  valueContainerSize?: number;
};

const sizeConfig: Record<TProgressCircleSize, SizeConfig> = {
  Small: {
    dimension: 16,
    strokeWidth: 2,
    textClass: 'text-caption-small'
  },
  Medium: {
    dimension: 32,
    strokeWidth: 3,
    textClass: 'text-caption-small',
    valueContainerSize: 36
  },
  Large: {
    dimension: 48,
    strokeWidth: 4,
    textClass: 'text-caption-medium',
    valueContainerSize: 52
  }
};

export const ProgressCircle = React.forwardRef<HTMLDivElement, TProgressCircleProps>(
  (
    {
      className,
      size = 'Large',
      variant = 'Determinate',
      value = 0,
      showValue = false,
      ariaLabel,
      ...otherProps
    },
    ref
  ) => {
    const config = sizeConfig[size];
    const { dimension, strokeWidth, textClass, valueContainerSize } = config;

    // Calculate circle properties
    const radius = (dimension - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = dimension / 2;

    // Clamp value between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value));

    // Calculate stroke-dashoffset for determinate progress
    // Positive offset with -90deg rotation makes progress fill clockwise from the top
    const progress = clampedValue / 100;
    const strokeDashoffset = circumference * (1 - progress);

    // Use valueContainerSize if showValue is true and available, otherwise use dimension
    const containerSize =
      showValue && valueContainerSize !== undefined ? valueContainerSize : dimension;

    const isDeterminate = variant === 'Determinate';

    return (
      <div
        ref={ref}
        className={clsx(
          'foundation-web-progress-circle inline-flex items-center justify-center',
          className
        )}
        role='progressbar'
        aria-label={ariaLabel}
        aria-valuemin={isDeterminate ? 0 : undefined}
        aria-valuemax={isDeterminate ? 100 : undefined}
        aria-valuenow={isDeterminate ? clampedValue : undefined}
        style={{
          width: containerSize,
          height: containerSize
        }}
        {...otherProps}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className='relative'>
          {/* Track circle (background) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill='none'
            strokeWidth={strokeWidth}
            style={{
              stroke: 'var(--color-shift-200)'
            }}
          />

          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill='none'
            strokeWidth={strokeWidth}
            strokeDasharray={
              isDeterminate ? circumference : `${circumference * 0.75} ${circumference * 0.25}`
            }
            strokeDashoffset={isDeterminate ? strokeDashoffset : 0}
            strokeLinecap='round'
            className={clsx(!isDeterminate && 'foundation-web-progress-circle-indeterminate')}
            // Rotate to start from top (or use animation for indeterminate)
            style={
              isDeterminate
                ? {
                    stroke: 'var(--fui-future-alpha-color-system-progress)',
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 0.3s ease-out'
                  }
                : {
                    stroke: 'var(--fui-future-alpha-color-system-progress)',
                    transformOrigin: '50% 50%'
                  }
            }
          />
        </svg>

        {/* Value label for determinate variant (Large size only) */}
        {isDeterminate && showValue && size === 'Large' && (
          <div
            className={clsx(
              'absolute content-emphasis flex items-center justify-center',
              textClass
            )}
            aria-hidden='true'>
            <span>{Math.round(clampedValue)}</span>
            <span>%</span>
          </div>
        )}
      </div>
    );
  }
);

ProgressCircle.displayName = 'ProgressCircle';
