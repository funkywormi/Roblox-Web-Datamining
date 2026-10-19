import type { TTailwindBgClass, TTailwindPaddingClass } from '@rbx/foundation-tailwind/classes';
import clsx from 'clsx';
import React, { ButtonHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import { interactable, StateLayer } from './StateLayer';

export type TCloseAffordanceSize = 'Small' | 'Medium' | 'Large';
export type TCloseAffordanceVariant = 'Utility' | 'OverMedia';

export type TCloseAffordanceProps = {
  variant: TCloseAffordanceVariant;
  size: TCloseAffordanceSize;
  isCircular: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const PADDING_CLASS_BY_SIZE: Record<TCloseAffordanceSize, TTailwindPaddingClass> = {
  Small: 'padding-xsmall',
  Medium: 'padding-small',
  Large: 'padding-medium'
};

const BACKGROUND_CLASS_BY_VARIANT: Record<TCloseAffordanceVariant, TTailwindBgClass> = {
  Utility: 'bg-action-link',
  OverMedia: 'bg-over-media-100'
};

export const CloseAffordance = ({
  variant,
  size,
  isCircular,
  className,
  ...props
}: TCloseAffordanceProps) => {
  return (
    <button
      type='button'
      className={clsx(
        'foundation-web-close-affordance flex stroke-none bg-none cursor-pointer',
        interactable,
        BACKGROUND_CLASS_BY_VARIANT[variant],
        PADDING_CLASS_BY_SIZE[size],
        isCircular && 'radius-circle',
        className
      )}
      {...props}>
      <StateLayer />
      <Icon name='icon-regular-x' size={size} />
    </button>
  );
};
