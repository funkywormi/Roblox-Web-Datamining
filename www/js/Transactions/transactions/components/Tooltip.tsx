import * as React from 'react';
import clsx from 'clsx';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Beak } from './internal/Beak';
import './internal/Common.css';

export const tooltipSides = ['top', 'bottom', 'left', 'right'] as const;
export const tooltipAligns = ['start', 'center', 'end'] as const;
export type TTooltipSide = (typeof tooltipSides)[number];
export type TTooltipAlign = (typeof tooltipAligns)[number];

export type TTooltipProps = {
  /**
   * Has twelve configurable positions (e.g., top-start, top-center, top-end,
   * left-start, left-center, left-end, right-start, right-center, right-end,
   * bottom-start, bottom-center, bottom-end), adapting from the Tooltip's edge.
   */
  position: `${TTooltipSide}-${TTooltipAlign}`;

  /**
   * Visually turn on/off the beak component.  Defaults to true.
   */
  hasBeak?: boolean;

  /**
   * Headline for the tooltip. Accepts a `ReactNode` for non-interactive rich
   * content (formatted text, icons, line breaks); pass `ariaLabel` alongside it.
   * Interactive content belongs in `EducationalTooltip`, not here.
   */
  title: React.ReactNode;

  /**
   * Optional description below the title (max ~3 lines). Same `ReactNode` /
   * `ariaLabel` guidance as `title`.
   */
  description?: React.ReactNode;

  /**
   * Plain-text screen-reader description. Radix clones rich `title`/`description`
   * into a hidden node for `aria-describedby`; passing `ariaLabel` renders that
   * text instead of a clone. A lone string `title` is used automatically, so
   * this is only needed when the content is rich (`ReactNode`).
   */
  ariaLabel?: string;

  /**
   * The delay duration in milliseconds before the tooltip appears.
   * Defaults to 500.
   */
  delayDurationMs?: number;

  /**
   * The controlled open state of the tooltip. Must be used in conjunction with onOpenChange.
   */
  open?: boolean;

  /**
   * Event handler called when the open state of the tooltip changes.
   */
  onOpenChange?: (open: boolean) => void;

  contentClassName?: string;

  children: React.ReactNode;
};

/**
 * Tooltip component, v1.0.0 (Alpha)
 */
export function Tooltip({
  position,
  hasBeak = true,
  title,
  description,
  ariaLabel,
  delayDurationMs = 500,
  children,
  open,
  onOpenChange,
  contentClassName
}: TTooltipProps) {
  const [side, align] = position.split('-');

  // Prefer an explicit `ariaLabel`; otherwise auto-derive from a lone string
  // `title` (skip when a `description` exists, so it isn't dropped). Falls back
  // to Radix cloning the content when neither applies.
  const resolvedAriaLabel =
    ariaLabel ?? (typeof title === 'string' && description == null ? title : undefined);

  return (
    <TooltipPrimitive.Provider delayDuration={delayDurationMs}>
      <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange}>
        {children}
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side as TTooltipSide}
            align={align as TTooltipAlign}
            aria-label={resolvedAriaLabel}
            className={clsx(
              'foundation-web-portal-zindex bg-inverse-surface-0 padding-y-xsmall padding-x-small radius-small shadow-transient-low',
              contentClassName
            )}
            sideOffset={5}>
            {hasBeak && (
              <TooltipPrimitive.Arrow asChild>
                <Beak className='content-[var(--inverse-surface-0)]' />
              </TooltipPrimitive.Arrow>
            )}
            <div className='flex flex-col text-truncate-split'>
              <div className='text-caption-medium content-inverse-default'>{title}</div>
              {description && (
                <div className='text-body-small padding-top-xsmall content-inverse-default max-width-[calc(var(--size-100)*50)]'>
                  {description}
                </div>
              )}
            </div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export type TTooltipTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function TooltipTrigger({ children, asChild, className }: TTooltipTriggerProps) {
  return (
    <TooltipPrimitive.Trigger asChild={asChild} className={className}>
      {children}
    </TooltipPrimitive.Trigger>
  );
}
