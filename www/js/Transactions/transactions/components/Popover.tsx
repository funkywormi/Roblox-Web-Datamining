import * as React from 'react';
import clsx from 'clsx';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import './internal/Common.css';

const defaultOnOpenAutoFocus = (e: Event) => {
  // when on mobile, prevent focus ring from showing on PopoverContent when it opens
  const isTouchDevice = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
  const isKeyboard = document.activeElement?.matches(':focus-visible');
  if (isTouchDevice && !isKeyboard) {
    e.preventDefault();
    return;
  }

  // look for the first focusable not-disabled menu item and focus it, otherwise default back to the content container
  const container = e.currentTarget as HTMLElement;
  const firstItem = container?.querySelector<HTMLElement>(
    '[role="menuitem"]:not([aria-disabled="true"])'
  );
  if (firstItem) {
    e.preventDefault();
    firstItem.focus();
  }
};

export const popoverSides = ['top', 'right', 'bottom', 'left'] as const;
export const popoverAligns = ['start', 'center', 'end'] as const;
export type TPopoverSide = (typeof popoverSides)[number];
export type TPopoverAlign = (typeof popoverAligns)[number];

export type TPopoverProps = {
  /** Controlled open state. */
  open?: boolean;

  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;

  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;

  children: React.ReactNode;
};

export function Popover({ open, defaultOpen, onOpenChange, children }: TPopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </PopoverPrimitive.Root>
  );
}

export type TPopoverTriggerProps = {
  asChild?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function PopoverTrigger({ asChild, disabled, className, children }: TPopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger asChild={asChild} disabled={disabled} className={className}>
      {children}
    </PopoverPrimitive.Trigger>
  );
}

// Labeling methods for dialog content. Note ariaLabel is available for backwards compatibility as an alias,
// but should be mutually exclusive with other aria label props.
type TAriaLabels =
  | { ariaLabel: string; ['aria-label']?: never; 'aria-labelledby'?: never }
  | { ariaLabel?: never; 'aria-label': string; 'aria-labelledby'?: never }
  | { ariaLabel?: never; 'aria-label'?: never; 'aria-labelledby': string };

export type TPopoverContentProps = {
  /** The preferred side of the anchor to render against. Will be reversed when collisions occur. @default 'bottom' */
  side?: TPopoverSide;
  /** The preferred alignment against the anchor. @default 'center' */
  align?: TPopoverAlign;
  /** The offset in pixels from the side of the anchor. @default 4 */
  sideOffset?: PopoverPrimitive.PopoverContentProps['sideOffset'];
  /** The offset in pixels from the alignment of the anchor. */
  alignOffset?: PopoverPrimitive.PopoverContentProps['alignOffset'];
  /** The element(s) used as the collision boundary. By default uses the viewport, but additional elements can be included. */
  collisionBoundary?: PopoverPrimitive.PopoverContentProps['collisionBoundary'];
  /** The distance in pixels from the boundary edges where collision detection should occur. Accepts a number (same for all sides), or a partial padding object */
  collisionPadding?: PopoverPrimitive.PopoverContentProps['collisionPadding'];
  className?: string;
  children: React.ReactNode;
  /** Accessible label for content. Generally recommended to be provided per WCAG dialog guidance. Alias for aria-label. */
  ariaLabel?: string;
  onKeyDown?: PopoverPrimitive.PopoverContentProps['onKeyDown'];
  onOpenAutoFocus?: PopoverPrimitive.PopoverContentProps['onOpenAutoFocus'];
} & TAriaLabels;

export function PopoverContent({
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  className,
  children,
  ariaLabel,
  onOpenAutoFocus,
  ...props
}: TPopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        side={side}
        align={align}
        sideOffset={sideOffset}
        {...props}
        aria-label={ariaLabel ?? props['aria-label']} // Should come after props to override
        onOpenAutoFocus={onOpenAutoFocus ?? defaultOnOpenAutoFocus}
        className={clsx('foundation-web-portal-zindex', className)}>
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

export type TPopoverCloseProps = {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
} & Pick<PopoverPrimitive.PopoverCloseProps, 'aria-label'>;

export function PopoverClose({ children, ...props }: TPopoverCloseProps) {
  return <PopoverPrimitive.Close {...props}>{children}</PopoverPrimitive.Close>;
}

export type TPopoverAnchorProps = {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function PopoverAnchor({ asChild, className, children }: TPopoverAnchorProps) {
  return (
    <PopoverPrimitive.Anchor asChild={asChild} className={className}>
      {children}
    </PopoverPrimitive.Anchor>
  );
}

export default Popover;
