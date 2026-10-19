import clsx from 'clsx';
import React, { ComponentProps, ReactNode, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type {
  TTailwindBgClass,
  TTailwindContentClass,
  TTailwindIconClass,
  TTailwindRadiusClass,
  TTailwindSizeClass
} from '@rbx/foundation-tailwind/classes';
import { interactable, StateLayer } from './internal/StateLayer';
import { disabledOpacity } from '../utils/styles';
import { TForwardRefComponent } from './types/TForwardRefComponent';

/** IconButton variant options */
export const iconButtonVariants = [
  'Emphasis',
  'Standard',
  'Alert',
  'Utility',
  'OverMedia'
] as const;

/** IconButton variant options */
export type TIconButtonVariant = (typeof iconButtonVariants)[number];

/** IconButton size options */
export const iconButtonSizes = ['XSmall', 'Small', 'Medium', 'Large'] as const;

/** IconButton size options */
export type TIconButtonSize = (typeof iconButtonSizes)[number];

export const iconButtonIconColors = ['Default', 'Inverse'] as const;
export type TIconButtonIconColor = (typeof iconButtonIconColors)[number];

type TIconButtonCoreProps = {
  /** Defines the icon. */
  icon: TTailwindIconClass;
  /** Defines the aria-label for accessibility. */
  ariaLabel: string;
  /** Defines the variant. */
  variant?: TIconButtonVariant;
  /**  Defines the size. */
  size?: TIconButtonSize;
  /** Defines the icon color theme. */
  iconColor?: TIconButtonIconColor;
  /** Defines if the button is circular. */
  isCircular?: boolean;
  /** Defines if the button is in a selected/active state. */
  isSelected?: boolean;
  /** Defines if the button is in the disabled state and cannot be clicked. */
  isDisabled?: boolean;
};

type TIconButtonAsChildProps<T extends 'button' | 'a'> =
  | {
      /**
       * When true, the IconButton will not render its own DOM element. Instead, it merges
       * its props (className, style, ref, etc.) onto its single child element.
       * Useful for rendering an IconButton as a framework link (e.g. Next.js Link).
       */
      asChild: true;
      children: ReactNode;
      as?: never;
    }
  | {
      asChild?: never;
      children?: never;
      as?: T;
    };

/**
 * Since ElementType can have overlap with our custom props,
 * we need to omit constraints on fields we define from the final props type.
 */
type TIconButtonVariantProps<T extends 'button' | 'a'> = Omit<
  React.ComponentPropsWithoutRef<T>,
  keyof TIconButtonCoreProps | 'disabled'
> &
  TIconButtonCoreProps &
  TIconButtonAsChildProps<T>;

export type TIconButtonProps =
  | (TIconButtonVariantProps<'button'> & {
      /** Defines the component HTML tag to render. */
      as?: 'button';
    })
  | (TIconButtonVariantProps<'a'> & {
      /** Defines the component HTML tag to render. */
      as: 'a';
    });

const SIZE_CLASS_BY_SIZE: Record<TIconButtonSize, TTailwindSizeClass> = {
  Large: 'size-1200',
  Medium: 'size-1000',
  Small: 'size-800',
  XSmall: 'size-600'
};

const ICON_SIZE_CLASS_BY_SIZE: Record<TIconButtonSize, TTailwindSizeClass> = {
  XSmall: 'size-400',
  Small: 'size-500',
  Medium: 'size-600',
  Large: 'size-700'
};

const RADIUS_CLASS_BY_SIZE_AND_CIRCULAR: Record<
  TIconButtonSize,
  Record<'circular' | 'square', TTailwindRadiusClass>
> = {
  Large: {
    circular: 'radius-circle',
    square: 'radius-medium'
  },
  Medium: {
    circular: 'radius-circle',
    square: 'radius-medium'
  },
  Small: {
    circular: 'radius-circle',
    square: 'radius-medium'
  },
  XSmall: {
    circular: 'radius-circle',
    square: 'radius-small'
  }
};

const BACKGROUND_COLOR_CLASS_BY_VARIANT: Record<TIconButtonVariant, TTailwindBgClass> = {
  Emphasis: 'bg-action-emphasis',
  Standard: 'bg-action-standard',
  Alert: 'bg-action-alert',
  Utility: 'bg-action-link',
  OverMedia: 'bg-over-media-0'
};

const DISABLED_BACKGROUND_COLOR_CLASS_BY_VARIANT: Record<TIconButtonVariant, TTailwindBgClass> = {
  Emphasis: 'bg-action-standard',
  Standard: 'bg-action-standard',
  Alert: 'bg-action-standard',
  Utility: 'bg-action-link',
  OverMedia: 'bg-over-media-0'
};

const SELECTED_BACKGROUND_COLOR_CLASS_BY_VARIANT: Record<TIconButtonVariant, TTailwindBgClass> = {
  Emphasis: 'bg-action-emphasis',
  Standard: 'bg-action-standard',
  Alert: 'bg-action-standard',
  Utility: 'bg-shift-300',
  OverMedia: 'bg-over-media-0'
};

const CONTENT_COLOR_CLASS_BY_ICON_COLOR: Record<
  TIconButtonIconColor,
  Record<TIconButtonVariant, TTailwindContentClass>
> = {
  Default: {
    Emphasis: 'content-action-emphasis',
    Standard: 'content-action-standard',
    Alert: 'content-action-alert',
    Utility: 'content-emphasis',
    OverMedia: 'content-emphasis'
  },
  Inverse: {
    Emphasis: 'content-inverse-action-emphasis',
    Standard: 'content-inverse-action-standard',
    Alert: 'content-inverse-action-alert',
    Utility: 'content-inverse-emphasis',
    OverMedia: 'content-inverse-emphasis'
  }
};

const DISABLED_CONTENT_COLOR_CLASS_BY_ICON_COLOR: Record<
  TIconButtonIconColor,
  Record<TIconButtonVariant, TTailwindContentClass>
> = {
  Default: {
    Emphasis: 'content-action-standard',
    Standard: 'content-action-standard',
    Alert: 'content-action-standard',
    Utility: 'content-emphasis',
    OverMedia: 'content-emphasis'
  },
  Inverse: {
    Emphasis: 'content-inverse-action-standard',
    Standard: 'content-inverse-action-standard',
    Alert: 'content-inverse-action-standard',
    Utility: 'content-inverse-emphasis',
    OverMedia: 'content-inverse-emphasis'
  }
};

const IconButtonComponent = (
  {
    className,
    icon,
    ariaLabel,
    isDisabled = false,
    isCircular = false,
    isSelected = false,
    size = 'Large',
    variant = 'Emphasis',
    iconColor = 'Default',
    asChild,
    children,
    ...props
  }: TIconButtonProps,
  ref: ComponentProps<'button' | 'a'>['ref']
) => {
  let bgClass: TTailwindBgClass;
  if (isDisabled) {
    bgClass = DISABLED_BACKGROUND_COLOR_CLASS_BY_VARIANT[variant];
  } else if (isSelected) {
    bgClass = SELECTED_BACKGROUND_COLOR_CLASS_BY_VARIANT[variant];
  } else {
    bgClass = BACKGROUND_COLOR_CLASS_BY_VARIANT[variant];
  }

  const buttonClasses = clsx(
    'foundation-web-icon-button',
    isDisabled ? disabledOpacity : [interactable, 'cursor-pointer'],
    'relative flex items-center justify-center padding-none stroke-none select-none',
    SIZE_CLASS_BY_SIZE[size],
    RADIUS_CLASS_BY_SIZE_AND_CIRCULAR[size][isCircular ? 'circular' : 'square'],
    bgClass,
    className
  );

  const buttonContent = (
    <React.Fragment>
      <StateLayer />
      <span
        className={clsx(
          'icon',
          icon,
          ICON_SIZE_CLASS_BY_SIZE[size],
          isDisabled
            ? DISABLED_CONTENT_COLOR_CLASS_BY_ICON_COLOR[iconColor][variant]
            : CONTENT_COLOR_CLASS_BY_ICON_COLOR[iconColor][variant]
        )}
      />
    </React.Fragment>
  );

  if (asChild) {
    const { as: _, ...restProps } = props;
    const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        {...restProps}
        className={buttonClasses}
        aria-label={ariaLabel}
        aria-disabled={isDisabled || undefined}>
        {React.cloneElement(child, {}, buttonContent)}
      </Slot>
    );
  }

  if (props.as === 'a') {
    const { as: _, href, ...restProps } = props;
    return (
      <a
        ref={ref as ComponentProps<'a'>['ref']}
        {...restProps}
        aria-label={ariaLabel}
        aria-disabled={isDisabled}
        href={isDisabled ? undefined : href}
        className={buttonClasses}>
        {buttonContent}
      </a>
    );
  }

  const { as: _, ...restProps } = props;
  return (
    <button
      ref={ref as ComponentProps<'button'>['ref']}
      type='button'
      {...restProps}
      aria-label={ariaLabel}
      disabled={isDisabled}
      className={buttonClasses}>
      {buttonContent}
    </button>
  );
};

export const IconButton = forwardRef(IconButtonComponent) as TForwardRefComponent<TIconButtonProps>;
