import clsx from 'clsx';
import React, { ComponentProps, ReactNode, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type {
  TTailwindBgClass,
  TTailwindContentClass,
  TTailwindRadiusClass,
  TTailwindTextLabelClass,
  TTailwindHeightClass,
  TTailwindPaddingXClass,
  TTailwindIconClass
} from '@rbx/foundation-tailwind/classes';
import { interactable, StateLayer } from './internal/StateLayer';
import { disabledOpacity } from '../utils/styles';
import { LoadingSpinner } from './internal/LoadingSpinner';
import { TForwardRefComponent } from './types/TForwardRefComponent';
import { Icon } from './Icon';

export const buttonVariants = [
  'Emphasis',
  'Standard',
  'SoftEmphasis',
  'Utility',
  'Link',
  'Alert',
  'ActionUtility' // Deprecated, use Utility instead
] as const;

/** Button variant options. */
export type TButtonVariant = (typeof buttonVariants)[number];

/** Button size options */
export const buttonSizes = ['XSmall', 'Small', 'Medium', 'Large'] as const;

/** Button size options */
export type TButtonSize = (typeof buttonSizes)[number];

type TButtonCoreProps = {
  /**
   * Defines the variant. ActionUtility variant is deprecated, use Utility instead.
   */
  variant?: TButtonVariant;
  /**  Defines the size. */
  size?: TButtonSize;
  /** Defines if the button is in the disabled state and cannot be clicked. */
  isDisabled?: boolean;
  /** Defines if the button is in the loading state and displays a loading spinner. */
  isLoading?: boolean;
  /** Defines the children this component can take. It is recommended to pass
   * text as per the design guidelines but is left flexible for consumers. */
  children?: ReactNode;
  /** An Icon to be rendered left of the button text. Not to be mistaken with IconButton */
  icon?: TTailwindIconClass;
};

type TButtonAsChildProps<T extends 'button' | 'a'> =
  | {
      /**
       * When true, the Button will not render its own DOM element. Instead, it merges
       * its props (className, style, ref, etc.) onto its single child element.
       * Useful for rendering a Button as a framework link (e.g. Next.js Link).
       */
      asChild: true;
      children: ReactNode;
      as?: never;
    }
  | {
      asChild?: never;
      children?: ReactNode;
      as?: T;
    };

/**
 * Since ElementType can have overlap with our custom props,
 * we need to omit constraints on fields we define from the final props type.
 */
type TButtonVariantProps<T extends 'button' | 'a'> = Omit<
  React.ComponentPropsWithoutRef<T>,
  keyof TButtonCoreProps | 'disabled'
> &
  TButtonCoreProps &
  TButtonAsChildProps<T>;

export type TButtonProps =
  | (TButtonVariantProps<'button'> & {
      /** Defines the component HTML tag to render. */
      as?: 'button';
    })
  | (TButtonVariantProps<'a'> & {
      /** Defines the component HTML tag to render. */
      as: 'a';
    });

const LOADING_SPINNER_DIMENSION_BY_SIZE: Record<TButtonSize, number> = {
  Large: 24,
  Medium: 20,
  Small: 16,
  XSmall: 12
};

const classesBySize: Record<
  TButtonSize,
  [TTailwindRadiusClass, TTailwindTextLabelClass, TTailwindHeightClass, TTailwindPaddingXClass]
> = {
  Large: ['radius-medium', 'text-label-large', 'height-1200', 'padding-x-medium'],
  Medium: ['radius-medium', 'text-label-medium', 'height-1000', 'padding-x-medium'],
  Small: ['radius-medium', 'text-label-small', 'height-800', 'padding-x-small'],
  XSmall: ['radius-small', 'text-label-small', 'height-600', 'padding-x-small']
};

const classesByVariant: Record<TButtonVariant, [TTailwindBgClass, TTailwindContentClass]> = {
  Emphasis: ['bg-action-emphasis', 'content-action-emphasis'],
  Standard: ['bg-action-standard', 'content-action-standard'],
  SoftEmphasis: ['bg-action-soft-emphasis', 'content-action-soft-emphasis'],
  Utility: ['bg-action-subtle', 'content-action-standard'],
  Link: ['bg-action-link', 'content-system-emphasis'],
  Alert: ['bg-action-alert', 'content-action-alert'],
  ActionUtility: ['bg-action-subtle', 'content-action-standard']
};

const disabledClassesByVariant: Record<TButtonVariant, [TTailwindBgClass, TTailwindContentClass]> =
  {
    Emphasis: ['bg-action-standard', 'content-action-standard'],
    Standard: ['bg-action-standard', 'content-action-standard'],
    SoftEmphasis: ['bg-action-standard', 'content-action-standard'],
    Utility: ['bg-action-subtle', 'content-action-standard'],
    Link: ['bg-action-link', 'content-system-emphasis'],
    Alert: ['bg-action-standard', 'content-action-standard'],
    ActionUtility: ['bg-action-subtle', 'content-action-standard']
  };

const ButtonComponent = (
  {
    children,
    className,
    style,
    isDisabled = false,
    isLoading = false,
    icon,
    size = 'Large',
    variant = 'Emphasis',
    asChild,
    ...props
  }: TButtonProps,
  ref: ComponentProps<'button' | 'a'>['ref']
) => {
  const buttonClasses = clsx(
    'foundation-web-button',
    isDisabled ? disabledOpacity : [interactable, 'cursor-pointer'],
    'relative flex items-center justify-center stroke-none padding-y-none select-none',
    classesBySize[size],
    isDisabled ? disabledClassesByVariant[variant] : classesByVariant[variant],
    className
  );

  const buttonStyle = { textDecoration: 'none', ...style };

  const renderContent = (textContent: ReactNode) => (
    <React.Fragment>
      <StateLayer />
      {isLoading && (
        // TODO: we need some aria label while loading
        <div aria-hidden='true' className='absolute flex'>
          <LoadingSpinner
            width={LOADING_SPINNER_DIMENSION_BY_SIZE[size]}
            height={LOADING_SPINNER_DIMENSION_BY_SIZE[size]}
          />
        </div>
      )}
      <span
        className={clsx(
          'flex items-center min-width-0',
          size === 'Large' || size === 'Medium' ? 'gap-small' : 'gap-xsmall',
          isLoading && 'invisible'
        )}>
        {icon && <Icon name={icon} size={size} />}
        <span className='padding-y-xsmall text-truncate-end text-no-wrap'>{textContent}</span>
      </span>
    </React.Fragment>
  );

  if (asChild) {
    const { as: _, ...restProps } = props;
    const child = React.Children.only(children) as React.ReactElement<
      Record<string, unknown> & { children?: ReactNode }
    >;
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        {...restProps}
        className={buttonClasses}
        style={buttonStyle}
        aria-disabled={isDisabled || undefined}>
        {React.cloneElement(child, {}, renderContent(child.props.children))}
      </Slot>
    );
  }

  if (props.as === 'a') {
    const { as: _, href, ...restProps } = props;
    return (
      <a
        ref={ref as ComponentProps<'a'>['ref']}
        {...restProps}
        aria-disabled={isDisabled}
        // This prevents the anchor tag from being focusable and triggerable.
        href={isDisabled ? undefined : href}
        className={buttonClasses}
        style={buttonStyle}>
        {renderContent(children)}
      </a>
    );
  }

  const { as: _, ...restProps } = props;
  return (
    <button
      ref={ref as ComponentProps<'button'>['ref']}
      type='button'
      {...restProps}
      disabled={isDisabled}
      className={buttonClasses}
      style={buttonStyle}>
      {renderContent(children)}
    </button>
  );
};

export const Button = forwardRef(ButtonComponent) as TForwardRefComponent<TButtonProps>;
