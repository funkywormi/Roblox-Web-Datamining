import clsx from 'clsx';
import React, { ComponentPropsWithRef } from 'react';
import * as Switch from '@radix-ui/react-switch';
import type {
  TTailwindWidthClass,
  TTailwindHeightClass,
  TTailwindSizeClass,
  TTailwindPaddingTopClass,
  TTailwindTextBodyClass
} from '@rbx/foundation-tailwind/classes';
import { interactable, StateLayer } from './internal/StateLayer';
import { disabledOpacity } from '../utils/styles';

export const toggleSizes = ['XSmall', 'Small', 'Medium', 'Large'] as const;
export type TToggleSize = (typeof toggleSizes)[number];

export const togglePlacements = ['Start', 'End'] as const;
export type TTogglePlacement = (typeof togglePlacements)[number];

type TToggleBaseProps = Omit<
  ComponentPropsWithRef<'button'>,
  'disabled' | 'defaultChecked' | 'aria-label' | 'aria-labelledby'
> & {
  size: TToggleSize;
  placement: TTogglePlacement;
  /** Initial checked state - use for uncontrolled inputs */
  defaultChecked?: boolean;
  /** Controlled checked state - use for controlled inputs */
  isChecked?: boolean;
  isDisabled?: boolean;
  hint?: string;
  onCheckedChange?: (isChecked: boolean) => void;
};

/** Toggle with visible label (label content provides the accessible name). */
export type TToggleWithLabel = TToggleBaseProps & {
  label: string;
  ['aria-label']?: string;
  ['aria-labelledby']?: never;
};

/** Toggle with aria-label (no visible label). */
export type TToggleWithAriaLabel = TToggleBaseProps & {
  ['aria-label']: string;
  label?: never;
  ['aria-labelledby']?: string;
};

/** Toggle with aria-labelledby (no visible label). */
export type TToggleWithAriaLabelledby = TToggleBaseProps & {
  ['aria-labelledby']: string;
  label?: never;
  ['aria-label']?: string;
};

/** One of: label (content), aria-label, or aria-labelledby must be provided for accessibility. */
export type TToggleProps = TToggleWithLabel | TToggleWithAriaLabel | TToggleWithAriaLabelledby;

type SizeDependentClasses = {
  toggleWidth: TTailwindWidthClass;
  toggleHeight: TTailwindHeightClass;
  thumbSize: TTailwindSizeClass;
  textSize: TTailwindTextBodyClass;
  textPadding: TTailwindPaddingTopClass | null;
};

const classesBySize: Record<TToggleSize, SizeDependentClasses> = {
  XSmall: {
    toggleWidth: 'width-700',
    toggleHeight: 'height-400',
    thumbSize: 'size-300',
    textSize: 'text-body-small',
    textPadding: null
  },
  Small: {
    toggleWidth: 'width-800',
    toggleHeight: 'height-500',
    thumbSize: 'size-400',
    textSize: 'text-body-small',
    textPadding: 'padding-top-xxsmall'
  },
  Medium: {
    toggleWidth: 'width-1000',
    toggleHeight: 'height-600',
    thumbSize: 'size-500',
    textSize: 'text-body-medium',
    textPadding: 'padding-top-xxsmall'
  },
  Large: {
    toggleWidth: 'width-1100',
    toggleHeight: 'height-600',
    thumbSize: 'size-500',
    textSize: 'text-body-large',
    textPadding: 'padding-top-xxsmall'
  }
};

export const Toggle = React.forwardRef<HTMLButtonElement, TToggleProps>(
  (
    {
      label,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      className,
      isChecked,
      isDisabled,
      size,
      hint,
      placement,
      onCheckedChange,
      ...otherProps
    },
    ref
  ) => {
    const { toggleWidth, toggleHeight, thumbSize, textSize, textPadding } = classesBySize[size];

    return (
      // Switch button inside label is associated control when label is present
      // eslint-disable-next-line jsx-a11y/label-has-associated-control
      <label
        className={clsx(
          'foundation-web-toggle flex items-start gap-medium',
          {
            [disabledOpacity]: isDisabled,
            'cursor-pointer': !isDisabled,
            'flex-row': placement === 'Start',
            'flex-row-reverse': placement === 'End'
          },
          className
        )}>
        <Switch.Root
          data-slot='toggle'
          {...otherProps}
          ref={ref}
          className={clsx(
            interactable,
            !isDisabled && 'cursor-pointer',
            'grow-0 shrink-0 basis-auto flex items-center padding-xxsmall stroke-none radius-circle transition-colors',
            toggleWidth,
            toggleHeight,
            'group/toggle',
            'data-[state=unchecked]:bg-action-standard',
            'data-[state=checked]:bg-system-contrast'
          )}
          disabled={isDisabled}
          checked={isChecked}
          onCheckedChange={onCheckedChange}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}>
          <StateLayer />
          <span
            className={clsx(
              'motion-safe:transition-[flex-grow] ease-standard-out duration-300',
              'group-data-[state=unchecked]/toggle:size-0',
              'group-data-[state=checked]/toggle:fill'
            )}
          />
          <Switch.Thumb
            className={clsx(
              'transition-colors radius-circle flex justify-center items-center',
              thumbSize,
              'data-[state=unchecked]:bg-[var(--color-content-emphasis)]',
              'data-[state=checked]:bg-[var(--inverse-content-emphasis)]'
            )}>
            <span
              className={clsx(
                'icon icon-filled-check transition-opacity',
                thumbSize,
                'group-data-[state=unchecked]/toggle:opacity-[0]',
                'group-data-[state=checked]/toggle:opacity-[1] group-data-[state=checked]/toggle:[transition-delay:50ms]'
              )}
            />
          </Switch.Thumb>
          <span
            className={clsx(
              'motion-safe:transition-[flex-grow] ease-standard-out duration-300',
              'group-data-[state=unchecked]/toggle:fill',
              'group-data-[state=checked]/toggle:size-0'
            )}
          />
        </Switch.Root>
        {label ? (
          <div className={clsx('flex flex-col fill', textSize)}>
            <span className={clsx('content-emphasis', textPadding)}>{label}</span>
            {hint && <span className='content-default'>{hint}</span>}
          </div>
        ) : null}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
