import React, { ReactNode } from 'react';
import clsx from 'clsx';
import type { TTailwindSizeClass, TTailwindWidthClass } from '@rbx/foundation-tailwind/classes';
import { TListItemSize, useListItemProvider } from './ListItem';
import { Icon, TIconProps, TIconSize } from './Icon';

const RADIO_CONTROL_SIZE_BY_SIZE: Record<TListItemSize, TTailwindSizeClass> = {
  XSmall: 'size-500',
  Small: 'size-500',
  Medium: 'size-600',
  Large: 'size-600'
};

const RADIO_INDICATOR_SIZE_BY_SIZE: Record<TListItemSize, TTailwindSizeClass> = {
  XSmall: 'size-200',
  Small: 'size-200',
  Medium: 'size-250',
  Large: 'size-250'
};

export type TRadioAccessoryProps = {
  isSelected: boolean;
};

/**
 * Can be used as a trailing accessory for a list item to indicate a selected state.
 */
export const ListItemRadioAccessory = ({ isSelected }: TRadioAccessoryProps) => {
  const { size } = useListItemProvider();
  return (
    <div
      className={clsx(
        RADIO_CONTROL_SIZE_BY_SIZE[size],
        'radius-circle flex items-center justify-center stroke-emphasis stroke-standard',
        isSelected ? 'bg-system-contrast' : 'bg-none'
      )}>
      {isSelected && (
        <div
          className={clsx(
            'radius-circle bg-inverse-action-sub-emphasis',
            RADIO_INDICATOR_SIZE_BY_SIZE[size]
          )}
        />
      )}
    </div>
  );
};

/**
 * Based on Figma on trailing chevron size. Not a 1-to-1 mapping from list item size to icon size.
 */
const TRAILING_ICON_SIZE_BY_LIST_ITEM_SIZE: Record<TListItemSize, TIconSize> = {
  XSmall: 'Small',
  Small: 'Medium',
  Medium: 'Medium',
  Large: 'Large'
};

/**
 * Leading and trailing icons are not the same size. This is intentional from design.
 */
const LEADING_ICON_SIZE_BY_LIST_ITEM_SIZE: Record<TListItemSize, TIconSize> = {
  XSmall: 'Small',
  Small: 'Medium',
  Medium: 'Large',
  Large: 'Large'
};

export type TListItemIconProps = Omit<TIconProps, 'size'>;

/**
 * An Icon wrapper for trailing accessories that automatically sizes based on the ListItem size.
 */
export const ListItemTrailingIcon = ({ ...props }: TListItemIconProps) => {
  const { size } = useListItemProvider();
  return <Icon {...props} size={TRAILING_ICON_SIZE_BY_LIST_ITEM_SIZE[size]} />;
};

/**
 * An Icon wrapper for leading accessories that automatically sizes based on the ListItem size.
 */
export const ListItemLeadingIcon = ({ ...props }: TListItemIconProps) => {
  const { size } = useListItemProvider();
  return <Icon {...props} size={LEADING_ICON_SIZE_BY_LIST_ITEM_SIZE[size]} />;
};

/**
 * A chevron icon accessory for list items, typically used as a trailing accessory
 * to indicate navigation or expandability.
 */
export const ListItemChevronTrailingAccessory = () => {
  return <ListItemTrailingIcon name='icon-filled-chevron-large-right' />;
};

const LEADING_ACCESSORY_WIDTH_BY_SIZE: Record<TListItemSize, TTailwindWidthClass> = {
  XSmall: 'width-600',
  Small: 'width-800',
  Medium: 'width-1000',
  Large: 'width-1400'
};

export type TLeadingAccessorySpacerProps = {
  children: ReactNode;
};

/**
 * A wrapper component for leading accessories that enforces a consistent width (design guideline)
 * based on the ListItem size and centers its content.
 */
export const ListItemLeadingAccessorySpacer = ({ children }: TLeadingAccessorySpacerProps) => {
  const { size } = useListItemProvider();
  return (
    <div
      className={clsx('flex items-center justify-center', LEADING_ACCESSORY_WIDTH_BY_SIZE[size])}>
      {children}
    </div>
  );
};
