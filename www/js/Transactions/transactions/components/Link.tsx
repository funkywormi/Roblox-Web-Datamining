/* eslint-disable react/destructuring-assignment -- props kept intact for discriminated-union narrowing */
import clsx from 'clsx';
import React, { ComponentProps, HTMLAttributeAnchorTarget, ReactNode, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type {
  TTailwindIconClass,
  TTailwindTextBodyClass,
  TTailwindContentClass
} from '@rbx/foundation-tailwind/classes';

export const linkSizes = ['Small', 'Medium', 'Large'] as const;
export type TLinkSize = (typeof linkSizes)[number];

export const linkColors = ['Standard', 'Emphasis', 'Inverse'] as const;
export type TLinkColor = (typeof linkColors)[number];

export const linkVariants = ['Inline', 'Standalone'] as const;
export type TLinkVariant = (typeof linkVariants)[number];

export const linkUnderlines = ['always', 'hover', 'none'] as const;
export type TLinkUnderline = (typeof linkUnderlines)[number];

export type TLinkElement = 'a' | 'button';

type TLinkCoreProps = {
  /** Determines the text size of the link. When omitted, typography will inherit from the parent. */
  size?: TLinkSize;
  /**
   * Determines the content color of the link. `Standard` and `Emphasis` share
   * the strong neutral text foreground but use different underline colors;
   * `Inverse` is for dark / inverse surfaces.
   *
   * @default Emphasis
   */
  color?: TLinkColor;
  /**
   * Determines the link type.
   * - `Inline`: rendered as part of a run of text; flows and wraps with the
   *   surrounding content.
   * - `Standalone`: rendered as a self-contained affordance (e.g. a call to
   *   action or list item); laid out as an inline flex container so a trailing
   *   external icon stays aligned with the label.
   *
   * @default Standalone
   */
  variant?: TLinkVariant;
  /**
   * Determines underline behavior.
   * - `always`: underline is always visible
   * - `hover`: underline appears on hover only
   * - `none`: no underline
   *
   * @default hover
   */
  underline?: TLinkUnderline;
  /**
   * Whether to show a trailing external link icon.
   * Defaults to `true` when `as` is `'a'` (default) and `target` is not
   * `_self`, `_parent`, or `_top`.
   */
  isExternal?: boolean;
};

type TLinkAsChildProps<T extends TLinkElement> =
  | {
      /**
       * When true, the Link will not render its own DOM element. Instead, it merges
       * its props (className, style, ref, etc.) onto its single child element.
       * Useful for rendering a Link as a framework link (e.g. Next.js Link).
       */
      asChild: true;
      children: ReactNode;
      as?: never;
    }
  | {
      asChild?: never;
      children?: ReactNode;
      /** Defines the HTML element to render. @default a */
      as?: T;
    };

type TLinkVariantProps<T extends TLinkElement> = Omit<
  React.ComponentPropsWithRef<T>,
  keyof TLinkCoreProps
> &
  TLinkCoreProps &
  TLinkAsChildProps<T>;

export type TLinkProps =
  | (TLinkVariantProps<'a'> & { as?: 'a' })
  | (TLinkVariantProps<'button'> & { as: 'button' });

const INTERNAL_TARGETS: Set<string> = new Set(['_self', '_parent', '_top']);

const EXTERNAL_ICON_NAME: TTailwindIconClass = 'icon-regular-arrow-up-right-from-square';

const TEXT_CLASS_BY_SIZE: Record<TLinkSize, TTailwindTextBodyClass> = {
  Small: 'text-body-small',
  Medium: 'text-body-medium',
  Large: 'text-body-large'
};

// Per the Figma spec, Standard and Emphasis use the same strong neutral text
// foreground. Their underline colors provide the visual distinction.
const CONTENT_CLASS_BY_COLOR: Record<TLinkColor, TTailwindContentClass> = {
  Standard: 'content-emphasis',
  Emphasis: 'content-emphasis',
  Inverse: 'content-inverse-default'
};

const BUTTON_RESET = 'bg-none stroke-none padding-none appearance-none [text-align:inherit]';

// Layout applied when the link should behave as an inline flex container: the
// `Standalone` variant, and any link that renders a trailing external icon so
// the icon stays vertically centered with the label.
const FLEX_LAYOUT = 'inline-flex items-center gap-xsmall';

const FOCUS_CLASSES =
  'radius-xsmall' +
  ' focus-visible:[outline-style:solid]' +
  ' focus-visible:[outline-width:var(--stroke-standard)]' +
  ' focus-visible:[outline-color:var(--color-system-emphasis)]';

function resolveIsExternal(
  isExternal?: boolean,
  elementType?: TLinkElement,
  target?: HTMLAttributeAnchorTarget
): boolean {
  if (isExternal !== undefined) {
    return isExternal;
  }
  if (elementType === 'button') {
    return false;
  }
  return target !== undefined && !INTERNAL_TARGETS.has(target);
}

// Note: this typing is needed to achieve ref type inference
type TLinkComponent = {
  (props: TLinkProps): React.ReactElement | null;
  displayName?: string;
};

/**
 * A styled link that supports multiple sizes, colors, variants, and underline behaviors.
 * Anchors with a non-internal target automatically render a trailing external-link icon.
 */
export const Link: TLinkComponent = forwardRef(
  (
    {
      children,
      className,
      size,
      color = 'Emphasis',
      variant = 'Standalone',
      underline = 'hover',
      isExternal: isExternalProp,
      asChild,
      ...props
    }: TLinkProps,
    ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    const elementType = props.as ?? 'a';
    const target = props.as === 'button' ? undefined : props.target;

    const resolvedIsExternal = resolveIsExternal(isExternalProp, elementType, target);

    const linkClasses = clsx(
      'foundation-web-link',
      props.as === 'button' && BUTTON_RESET,
      (variant === 'Standalone' || resolvedIsExternal) && FLEX_LAYOUT,
      size !== undefined && TEXT_CLASS_BY_SIZE[size],
      CONTENT_CLASS_BY_COLOR[color],
      underline === 'always' ? 'underline' : 'no-underline',
      underline === 'hover' && 'hover:underline',
      'motion-safe:transition-opacity',
      'hover:cursor-pointer hover:[opacity:0.8]',
      FOCUS_CLASSES,
      className
    );

    const externalIcon = resolvedIsExternal ? (
      <span
        aria-hidden
        data-testid='foundation-web-icon'
        className={clsx('grow-0 shrink-0 basis-auto icon size-[1em]', EXTERNAL_ICON_NAME)}
      />
    ) : null;

    if (asChild) {
      const { as: _, ...restProps } = props;
      const child = React.Children.only(children);
      if (!React.isValidElement<{ children?: ReactNode }>(child)) {
        return null;
      }
      // For some reason this fails type check without the cast explicit cast.
      const slotProps = restProps as React.ComponentPropsWithoutRef<typeof Slot>;
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} {...slotProps} className={linkClasses}>
          {React.cloneElement(
            child,
            {},
            <React.Fragment>
              {child.props.children}
              {externalIcon}
            </React.Fragment>
          )}
        </Slot>
      );
    }

    if (props.as === 'button') {
      const { as: _, type, ...restProps } = props;
      return (
        <button
          ref={ref as ComponentProps<'button'>['ref']}
          // eslint-disable-next-line react/button-has-type -- intended override
          type={type ?? 'button'}
          {...restProps}
          className={linkClasses}>
          {children}
          {externalIcon}
        </button>
      );
    }

    const { as: _, ...restProps } = props;
    return (
      <a ref={ref as ComponentProps<'a'>['ref']} {...restProps} className={linkClasses}>
        {children}
        {externalIcon}
      </a>
    );
  }
);
Link.displayName = 'Link';
