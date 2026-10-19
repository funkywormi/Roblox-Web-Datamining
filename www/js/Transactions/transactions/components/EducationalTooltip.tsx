import * as React from 'react';
import clsx from 'clsx';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import useInverseThemeClass from '../utils/useInverseThemeClass';
import useId from '../utils/useId';
import { Beak } from './internal/Beak';
import { Button } from './Button';
import type { TButtonVariant, TButtonSize } from './Button';
import './internal/Common.css';
import { CloseAffordance } from './internal/CloseAffordance';

const EducationalTooltipContentContext = React.createContext({
  hasCloseAffordance: false,
  titleId: '',
  descriptionId: ''
});

// following Popover code
const defaultOnOpenAutoFocus = (e: Event) => {
  const isTouchDevice = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
  const isKeyboard = document.activeElement?.matches(':focus-visible');
  if (isTouchDevice && !isKeyboard) {
    e.preventDefault();
  }
};

export const educationalTooltipSides = ['top', 'bottom', 'left', 'right'] as const;
export const educationalTooltipAligns = ['start', 'center', 'end'] as const;
export type TEducationalTooltipSide = (typeof educationalTooltipSides)[number];
export type TEducationalTooltipAlign = (typeof educationalTooltipAligns)[number];

export type TEducationalTooltipProps = {
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

/**
 * A click-triggered, interactive tooltip for onboarding, feature announcements,
 * and multi-step instructions. Built on Radix Popover with `role="dialog"` semantics.
 *
 * Uses a compound component API — compose the pieces you need:
 *
 * - `EducationalTooltipTrigger` — the element that opens the tooltip on click/tap.
 * - `EducationalTooltipContent` — portal-rendered overlay with positioning, beak, and
 *   optional close affordance.
 * - `EducationalTooltipBody` — padded container for title and description text.
 * - `EducationalTooltipTitle` / `EducationalTooltipDescription` — typography wrappers.
 * - `EducationalTooltipFullWidthFooter` — prescriptive footer with primary/secondary actions.
 * - `EducationalTooltipCustomFooter` — open-slot footer for full control.
 *
 * Example usage:
 *
 * ```tsx
 * <EducationalTooltip>
 *   <EducationalTooltipTrigger asChild>
 *     <IconButton icon="icon-regular-circle-i" ariaLabel="Learn more" />
 *   </EducationalTooltipTrigger>
 *   <EducationalTooltipContent position="bottom-center" hasCloseAffordance closeLabel="Close">
 *     <EducationalTooltipBody>
 *       <EducationalTooltipTitle>New Feature</EducationalTooltipTitle>
 *       <EducationalTooltipDescription>
 *         Click here to access your new dashboard with real-time analytics.
 *       </EducationalTooltipDescription>
 *     </EducationalTooltipBody>
 *     <EducationalTooltipFullWidthFooter
 *       primaryAction={{ label: 'Got it', onClick: handleDismiss }}
 *     />
 *   </EducationalTooltipContent>
 * </EducationalTooltip>
 * ```
 */
export const EducationalTooltip = ({
  open,
  defaultOpen,
  onOpenChange,
  children
}: TEducationalTooltipProps) => (
  <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    {children}
  </PopoverPrimitive.Root>
);

export type TEducationalTooltipTriggerProps = {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
};

export const EducationalTooltipTrigger = ({
  asChild,
  className,
  children
}: TEducationalTooltipTriggerProps) => (
  <PopoverPrimitive.Trigger asChild={asChild} className={className}>
    {children}
  </PopoverPrimitive.Trigger>
);

type TCloseAffordanceContentProps =
  | {
      hasCloseAffordance?: false;
      closeLabel?: never;
    }
  | {
      hasCloseAffordance: boolean;
      closeLabel: string;
    };

export type TEducationalTooltipContentProps = TCloseAffordanceContentProps & {
  /**
   * Twelve configurable positions controlling where the tooltip appears
   * relative to its trigger (e.g., top-start, bottom-center, right-end).
   */
  position: `${TEducationalTooltipSide}-${TEducationalTooltipAlign}`;
  /** Show/hide the beak (arrow). Defaults to true. */
  hasBeak?: boolean;
  /** Override auto-focus behavior when the tooltip opens. */
  onOpenAutoFocus?: (event: Event) => void;
  className?: string;
  children: React.ReactNode;
};

export const EducationalTooltipContent = ({
  position,
  hasBeak = true,
  hasCloseAffordance,
  closeLabel,
  onOpenAutoFocus,
  className,
  children
}: TEducationalTooltipContentProps) => {
  const [side, align] = position.split('-');
  const inverseThemeClass = useInverseThemeClass();
  const baseId = useId('fui-edu-tooltip');
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-desc`;
  const contextValue = React.useMemo(
    () => ({ hasCloseAffordance: !!hasCloseAffordance, titleId, descriptionId }),
    [hasCloseAffordance, titleId, descriptionId]
  );

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        side={side as TEducationalTooltipSide}
        align={align as TEducationalTooltipAlign}
        sideOffset={6}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onOpenAutoFocus={onOpenAutoFocus ?? defaultOnOpenAutoFocus}
        className={clsx(
          inverseThemeClass,
          'relative foundation-web-portal-zindex bg-surface-100 radius-medium shadow-transient-low',
          'min-width-[240px] max-width-[296px]',
          className
        )}>
        {hasBeak && (
          <PopoverPrimitive.Arrow asChild>
            <div style={{ color: 'var(--color-surface-100)' }}>
              <Beak />
            </div>
          </PopoverPrimitive.Arrow>
        )}

        {hasCloseAffordance && (
          <div className='absolute top-[var(--size-50)] right-[var(--size-100)]'>
            <PopoverPrimitive.Close asChild>
              <CloseAffordance
                variant='Utility'
                size='Medium'
                isCircular
                aria-label={closeLabel || ''}
              />
            </PopoverPrimitive.Close>
          </div>
        )}

        <EducationalTooltipContentContext.Provider value={contextValue}>
          {children}
        </EducationalTooltipContentContext.Provider>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

export type TEducationalTooltipBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export const EducationalTooltipBody = ({ children, className }: TEducationalTooltipBodyProps) => {
  const { hasCloseAffordance } = React.useContext(EducationalTooltipContentContext);
  return (
    <div
      className={clsx(
        'padding-medium',
        hasCloseAffordance && 'padding-right-[var(--size-1100)]',
        className
      )}>
      {children}
    </div>
  );
};

export type TEducationalTooltipTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export const EducationalTooltipTitle = ({ children, className }: TEducationalTooltipTitleProps) => {
  const { titleId } = React.useContext(EducationalTooltipContentContext);
  return (
    <div id={titleId} className={clsx('text-title-large content-emphasis', className)}>
      {children}
    </div>
  );
};

export type TEducationalTooltipDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export const EducationalTooltipDescription = ({
  children,
  className
}: TEducationalTooltipDescriptionProps) => {
  const { descriptionId } = React.useContext(EducationalTooltipContentContext);
  return (
    <div
      id={descriptionId}
      className={clsx('text-body-medium content-default padding-top-xsmall', className)}>
      {children}
    </div>
  );
};

export type TEducationalTooltipFooterAction = {
  label: string;
  onClick: () => void;
  variant?: TButtonVariant;
  size?: TButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
};

export type TEducationalTooltipFullWidthFooterProps = {
  /** Primary action button (e.g., "Next", "Got it"). */
  primaryAction: TEducationalTooltipFooterAction;

  /** Optional secondary action button (e.g., "Dismiss"). */
  secondaryAction?: TEducationalTooltipFooterAction;

  className?: string;
};

export const EducationalTooltipFullWidthFooter = ({
  primaryAction,
  secondaryAction,
  className
}: TEducationalTooltipFullWidthFooterProps) => {
  const {
    label: primaryLabel,
    variant: primaryVariant,
    size: primarySize = 'Small',
    className: primaryClassName,
    ...primaryRest
  } = primaryAction;

  const {
    label: secondaryLabel,
    variant: secondaryVariant,
    size: secondarySize = 'Small',
    className: secondaryClassName,
    ...secondaryRest
  } = secondaryAction ?? ({} as TEducationalTooltipFooterAction);

  return (
    <div className={clsx('flex gap-medium padding-medium padding-top-none', className)}>
      <Button
        variant={primaryVariant ?? 'Emphasis'}
        size={primarySize}
        className={clsx('width-full', primaryClassName)}
        {...primaryRest}>
        {primaryLabel}
      </Button>
      {secondaryAction && (
        <Button
          variant={secondaryVariant ?? 'Standard'}
          size={secondarySize}
          className={clsx('width-full', secondaryClassName)}
          {...secondaryRest}>
          {secondaryLabel}
        </Button>
      )}
    </div>
  );
};

export type TEducationalTooltipCustomFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export const EducationalTooltipCustomFooter = ({
  children,
  className
}: TEducationalTooltipCustomFooterProps) => (
  <div className={clsx('padding-medium padding-top-medium', className)}>{children}</div>
);
