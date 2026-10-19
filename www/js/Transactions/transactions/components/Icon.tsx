import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';
import clsx from 'clsx';
import React, { ComponentPropsWithRef } from 'react';

export const iconSizes = ['XSmall', 'Small', 'Medium', 'Large', 'XLarge', 'XXLarge'] as const;
export type TIconSize = (typeof iconSizes)[number];

export type TIconProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** The Tailwind class name of the icon to display. */
  name: TTailwindIconClass;
  /** The size of the icon. */
  size?: TIconSize;
};

const classesBySize: Record<TIconSize, string> = {
  XSmall: 'size-[var(--icon-size-xsmall)]',
  Small: 'size-[var(--icon-size-small)]',
  Medium: 'size-[var(--icon-size-medium)]',
  Large: 'size-[var(--icon-size-large)]',
  XLarge: 'size-[var(--icon-size-xlarge)]',
  XXLarge: 'size-[var(--icon-size-xxlarge)]'
};

/**
 * An icon component for primarily presentational purposes only. If you need an interactable icon,
 * please use the `IconButton` component or provide the correct aria and accessibility attributes
 * as props to this component.
 */
export const Icon: React.FC<TIconProps> = React.forwardRef<HTMLSpanElement, TIconProps>(
  ({ name, size = 'Medium', className, children, ...otherProps }, ref) => {
    // Children not allowed for icons.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = children;
    return (
      <span
        ref={ref}
        aria-hidden
        data-testid='foundation-web-icon'
        className={clsx('grow-0 shrink-0 basis-auto icon', name, classesBySize[size], className)}
        {...otherProps}
      />
    );
  }
);

Icon.displayName = 'Icon';
