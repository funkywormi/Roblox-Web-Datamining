import clsx from 'clsx';
import React, { createContext, ForwardedRef, forwardRef, ReactNode, useMemo } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import type {
  TTailwindHeightClass,
  TTailwindGapClass,
  TTailwindRadiusClass,
  TTailwindTextBodyClass,
  TTailwindPaddingXClass,
  TTailwindSizeClass,
  TTailwindTextTitleClass
} from '@rbx/foundation-tailwind/classes';
import { StateLayer } from './internal/StateLayer';
import { disabledOpacity } from '../utils/styles';
import './internal/Common.css';
import './Dropdown.css';
import useId from '../utils/useId';
import { TForwardRefComponent } from './types/TForwardRefComponent';
import { LabelTooltip, TLabelTooltipConfig } from './internal/LabelTooltip';
import {
  INPUT_BACKGROUND_BY_VARIANT,
  INPUT_STROKE_BY_VARIANT,
  type TInputVariant
} from './internal/input-variants';

export { INPUT_VARIANTS as dropdownVariants } from './internal/input-variants';
export type TDropdownVariant = TInputVariant;

export const dropdownSizes = ['XSmall', 'Small', 'Medium', 'Large'] as const;
export type TDropdownSize = (typeof dropdownSizes)[number];

export type TDropdownContext = {
  size: TDropdownSize;
};

export const DropdownContext = createContext<TDropdownContext | null>(null);

export type TDropdownValue = string;

export type TDropdownProps = {
  label?: string;
  /**
   * Optional info-icon tooltip rendered beside the label. Set `title`, and
   * optionally `description` and `position`.
   */
  labelTooltip?: TLabelTooltipConfig;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  size: TDropdownSize;
  variant?: TDropdownVariant;
  value?: TDropdownValue;
  placeholder: string;
  isDisabled?: boolean;
  hint?: string;
  hasError?: boolean;
  className?: string;
  onValueChange?: (value: TDropdownValue) => void;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

const CHEVRON_SIZE_CLASS_BY_SIZE: Record<TDropdownSize, TTailwindSizeClass> = {
  XSmall: 'size-300',
  Small: 'size-400',
  Medium: 'size-500',
  Large: 'size-600'
};

const PADDING_X_CLASS_BY_SIZE: Record<TDropdownSize, TTailwindPaddingXClass> = {
  XSmall: 'padding-x-medium',
  Small: 'padding-x-medium',
  Medium: 'padding-x-medium',
  Large: 'padding-x-large'
};

const LABEL_CLASS_BY_SIZE: Record<TDropdownSize, TTailwindTextTitleClass> = {
  XSmall: 'text-title-small',
  Small: 'text-title-small',
  Medium: 'text-title-medium',
  Large: 'text-title-large'
};

const TEXT_CLASS_BY_SIZE: Record<TDropdownSize, TTailwindTextBodyClass> = {
  XSmall: 'text-body-small',
  Small: 'text-body-small',
  Medium: 'text-body-medium',
  Large: 'text-body-large'
};

const GAP_CLASS_BY_SIZE: Record<TDropdownSize, TTailwindGapClass> = {
  XSmall: 'gap-xsmall',
  Small: 'gap-small',
  Medium: 'gap-small',
  Large: 'gap-small'
};

const DROPDOWN_RADIUS_CLASS_BY_SIZE: Record<TDropdownSize, TTailwindRadiusClass> = {
  XSmall: 'radius-small',
  Small: 'radius-medium',
  Medium: 'radius-medium',
  Large: 'radius-medium'
};

const HEIGHT_CLASS_BY_SIZE: Record<TDropdownSize, TTailwindHeightClass> = {
  XSmall: 'height-600',
  Small: 'height-800',
  Medium: 'height-1000',
  Large: 'height-1200'
};

export const Dropdown = forwardRef(
  (
    {
      label,
      labelTooltip,
      ariaLabelledBy,
      ariaLabel,
      className,
      size,
      variant = 'Standard',
      value,
      placeholder,
      isDisabled,
      hasError,
      hint: helperText,
      onValueChange,
      onOpenChange,
      children
    }: TDropdownProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const labelId = useId();
    const contextValue = useMemo(() => ({ size }), [size]);
    const labelNode = label ? (
      <span id={labelId} className={clsx(LABEL_CLASS_BY_SIZE[size], 'content-emphasis')}>
        {label}
      </span>
    ) : null;
    return (
      <DropdownContext.Provider value={contextValue}>
        <div
          className={clsx(
            'flex flex-col',
            isDisabled && [disabledOpacity, 'pointer-events-none'],
            GAP_CLASS_BY_SIZE[size],
            className
          )}>
          {labelNode &&
            (labelTooltip ? (
              <div className='flex items-center gap-xsmall'>
                {labelNode}
                <LabelTooltip {...labelTooltip} />
              </div>
            ) : (
              labelNode
            ))}
          <RadixSelect.Root
            value={value}
            disabled={isDisabled}
            onValueChange={onValueChange}
            onOpenChange={onOpenChange}>
            <RadixSelect.Trigger
              className={clsx(
                'relative clip group/interactable outline-none',
                'foundation-web-input flex items-center justify-between width-full cursor-pointer',
                INPUT_BACKGROUND_BY_VARIANT[variant],
                INPUT_STROKE_BY_VARIANT[variant],
                DROPDOWN_RADIUS_CLASS_BY_SIZE[size],
                HEIGHT_CLASS_BY_SIZE[size],
                PADDING_X_CLASS_BY_SIZE[size],
                TEXT_CLASS_BY_SIZE[size],
                hasError
                  ? 'stroke-system-alert focus-within:stroke-system-alert'
                  : 'stroke-contrast-alpha focus-within:stroke-system-emphasis',
                value === undefined ? 'content-muted' : 'content-default'
              )}
              ref={ref}
              aria-labelledby={label ? labelId : ariaLabelledBy}
              aria-label={ariaLabel}>
              <StateLayer />
              <div className='grow-1 text-truncate-split text-align-x-left'>
                <RadixSelect.Value placeholder={placeholder} />
              </div>
              <RadixSelect.Icon
                className={clsx(
                  CHEVRON_SIZE_CLASS_BY_SIZE[size],
                  'icon icon-regular-chevron-large-down content-default'
                )}
              />
            </RadixSelect.Trigger>

            <RadixSelect.Portal>
              <RadixSelect.Content
                position='popper'
                className='padding-y-small foundation-web-portal-zindex'
                style={{ maxHeight: 'var(--radix-select-content-available-height)' }}>
                {children}
              </RadixSelect.Content>
            </RadixSelect.Portal>
          </RadixSelect.Root>

          {helperText && (
            <span
              className={clsx('text-caption-small', {
                'content-system-alert': hasError,
                'content-default': !hasError
              })}>
              {helperText}
            </span>
          )}
        </div>
      </DropdownContext.Provider>
    );
  }
) as TForwardRefComponent<TDropdownProps>;

Dropdown.displayName = 'Dropdown';

export default Dropdown;
