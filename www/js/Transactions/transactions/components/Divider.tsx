import clsx from 'clsx';
import React, { ComponentProps, forwardRef, CSSProperties } from 'react';
import { TForwardRefComponent } from './types/TForwardRefComponent';

export const dividerOrientations = ['horizontal', 'vertical'] as const;
export type TDividerOrientation = (typeof dividerOrientations)[number];

export const dividerVariants = ['Standard', 'Thick', 'Inset', 'InsetLeft', 'InsetRight'] as const;
export type TDividerVariant = (typeof dividerVariants)[number];

export type TDividerProps = Omit<ComponentProps<'div'>, 'size'> & {
  orientation?: TDividerOrientation;
  variant?: TDividerVariant;
};

const DividerComponent = (
  { className, style, orientation = 'horizontal', variant = 'Standard', ...props }: TDividerProps,
  ref: ComponentProps<'div'>['ref']
) => {
  const isVertical = orientation === 'vertical';

  let specificStyles: CSSProperties;
  if (isVertical) {
    specificStyles = {
      height: '100%',
      width: 0,
      borderLeftWidth: 'var(--stroke-standard)',
      borderTopWidth: 0
    };
  } else if (variant === 'Thick') {
    specificStyles = {
      height: 'var(--size-250)',
      borderTop: 'var(--stroke-standard)',
      borderLeftWidth: 0,
      background: 'var(--color-common-heavydivider, rgba(0, 0, 0, 0.50))'
    };
  } else {
    specificStyles = {
      height: 0,
      borderTopWidth: 'var(--stroke-standard)',
      borderLeftWidth: 0
    };
  }

  let insetStyles: CSSProperties = {};
  if (!isVertical && variant === 'Inset') {
    insetStyles = {
      marginLeft: 'var(--padding-xlarge)',
      marginRight: 'var(--padding-xlarge)'
    };
  } else if (!isVertical && variant === 'InsetLeft') {
    insetStyles = {
      marginLeft: 'var(--padding-xlarge)'
    };
  } else if (!isVertical && variant === 'InsetRight') {
    insetStyles = {
      marginRight: 'var(--padding-xlarge)'
    };
  }

  return (
    <div
      ref={ref}
      {...props}
      role='separator'
      data-orientation={orientation}
      aria-orientation={orientation}
      style={{
        borderRightWidth: 0,
        borderBottomWidth: 0,
        boxSizing: 'border-box',
        borderStyle: 'solid',
        ...specificStyles,
        ...insetStyles,
        ...style
      }}
      className={clsx('stroke-default self-stretch', className)}
    />
  );
};

export const Divider = forwardRef(DividerComponent) as TForwardRefComponent<TDividerProps>;
Divider.displayName = 'Divider';
