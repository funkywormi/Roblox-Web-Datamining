import clsx from 'clsx';
import React from 'react';
import type { CSSProperties, TextareaHTMLAttributes } from 'react';
import type {
  TTailwindPaddingXClass,
  TTailwindPaddingYClass,
  TTailwindTextBodyClass,
  TTailwindTextTitleClass
} from '@rbx/foundation-tailwind/classes';
import useId from '../utils/useId';
import { disabledOpacity } from '../utils/styles';
import './internal/Common.css';
import {
  INPUT_BACKGROUND_BY_VARIANT,
  INPUT_STROKE_BY_VARIANT,
  type TInputVariant
} from './internal/input-variants';

export { INPUT_VARIANTS as textAreaVariants } from './internal/input-variants';
export type TTextAreaVariant = TInputVariant;

export const textAreaSizes = ['XSmall', 'Small', 'Medium', 'Large'] as const;
export type TTextAreaSize = (typeof textAreaSizes)[number];

export type TTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'disabled'> & {
  size?: TTextAreaSize;
  variant?: TTextAreaVariant;
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  isDisabled?: boolean;
  hasError?: boolean;
  /** Helper text to be displayed below the textarea field. Accepts rich content (e.g. links). */
  helperText?: React.ReactNode;
  textareaClassName?: string;
  textareaStyle?: CSSProperties;
};

const TEXT_AREA_PADDING_X: Record<TTextAreaSize, TTailwindPaddingXClass> = {
  XSmall: 'padding-x-small',
  Small: 'padding-x-medium',
  Medium: 'padding-x-medium',
  Large: 'padding-x-medium'
};

const TEXT_AREA_PADDING_Y: Record<TTextAreaSize, TTailwindPaddingYClass> = {
  XSmall: 'padding-y-small',
  Small: 'padding-y-small',
  Medium: 'padding-y-small',
  Large: 'padding-y-small'
};

const DEFAULT_SIZE = 'Large';

const LABEL_FONT_CLASS_BY_SIZE: Record<TTextAreaSize, TTailwindTextTitleClass> = {
  XSmall: 'text-title-small',
  Small: 'text-title-small',
  Medium: 'text-title-medium',
  Large: 'text-title-large'
};

const TEXT_CLASSES_BY_SIZE: Record<
  TTextAreaSize,
  [TTailwindTextBodyClass, `placeholder:${TTailwindTextBodyClass}`]
> = {
  XSmall: ['text-body-small', 'placeholder:text-body-small'],
  Small: ['text-body-small', 'placeholder:text-body-small'],
  Medium: ['text-body-medium', 'placeholder:text-body-medium'],
  Large: ['text-body-large', 'placeholder:text-body-large']
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TTextAreaProps>(
  (
    {
      size,
      variant = 'Standard',
      label,
      value,
      defaultValue,
      isDisabled,
      hasError,
      helperText,
      className,
      style,
      textareaClassName,
      textareaStyle,
      id,
      ...otherProps
    },
    ref
  ) => {
    const autoId = useId();
    const resolvedId = id || autoId;
    const descriptionId = `${resolvedId}-description`;
    const textAreaSize = size ?? DEFAULT_SIZE;

    return (
      <div
        className={clsx(
          'flex fill flex-col width-full gap-small',
          {
            [disabledOpacity]: isDisabled
          },
          className
        )}
        style={style}>
        {label && (
          <label
            htmlFor={resolvedId}
            className={clsx(LABEL_FONT_CLASS_BY_SIZE[textAreaSize], 'content-emphasis')}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={resolvedId}
          data-testid='text-area-container'
          style={textareaStyle}
          className={clsx(
            'foundation-web-text-area foundation-web-input outline-none',
            'radius-medium content-emphasis placeholder:content-muted',
            INPUT_BACKGROUND_BY_VARIANT[variant],
            INPUT_STROKE_BY_VARIANT[variant],
            hasError
              ? 'stroke-system-alert focus-within:stroke-system-alert'
              : 'stroke-contrast-alpha focus-within:stroke-system-emphasis',
            TEXT_CLASSES_BY_SIZE[textAreaSize],
            TEXT_AREA_PADDING_X[textAreaSize],
            TEXT_AREA_PADDING_Y[textAreaSize],
            textareaClassName
          )}
          value={value}
          defaultValue={value == null ? defaultValue : undefined}
          disabled={isDisabled}
          aria-describedby={helperText ? descriptionId : undefined}
          {...otherProps}
        />
        {helperText && (
          <span
            id={descriptionId}
            className={clsx('text-caption-small', {
              'content-system-alert': hasError,
              'content-default': !hasError
            })}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
