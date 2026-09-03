import React, { useState, useCallback } from 'react';
import { Popover, PopoverTrigger, PopoverContent, IconButton } from '@rbx/foundation-ui';
import { localStorageService } from 'core-roblox-utilities';

export type EducationalTooltipProps = {
  /** The trigger element that the tooltip attaches to */
  children: React.ReactNode;
  /** Title text displayed in the tooltip */
  title: string;
  /** Description text displayed in the tooltip */
  description: string;
  /** LocalStorage key to persist dismissed state */
  localStorageKey: string;
  /** Offset of the beak from the left edge (to align with trigger center) */
  beakLeftOffset?: number;
  /** Called when the tooltip is dismissed */
  onDismiss?: () => void;
};

// This callout can appear after async eligibility checks resolve, so opening it must not interrupt
// an interaction already in progress elsewhere on the page.
const preventOpenAutoFocus = (event: Event): void => {
  event.preventDefault();
};

const EducationalTooltip = ({
  children,
  title,
  description,
  localStorageKey,
  beakLeftOffset = 24,
  onDismiss
}: EducationalTooltipProps): JSX.Element => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return !!localStorageService.getLocalStorage(localStorageKey);
  });

  const dismissTooltip = useCallback(() => {
    setIsDismissed(true);
    localStorageService.setLocalStorage(localStorageKey, true);
    onDismiss?.();
  }, [localStorageKey, onDismiss]);

  const handleTriggerClick = useCallback(() => {
    // Once dismissed the wrapper stays mounted but only proxies clicks to the child.
    if (!isDismissed) {
      dismissTooltip();
    }
  }, [isDismissed, dismissTooltip]);

  // Always render the same Popover/trigger wrapper and just toggle the bubble. Swapping to a bare
  // fragment on dismissal would reparent `children`, remounting an interactive child (e.g. an
  // attachment menu) and resetting its state, so first-time users would have to click twice.
  return (
    <Popover open={!isDismissed}>
      <PopoverTrigger asChild>
        <span onClick={handleTriggerClick} role='presentation'>
          {children}
        </span>
      </PopoverTrigger>
      {!isDismissed && (
        <PopoverContent
          side='bottom'
          align='start'
          sideOffset={8}
          ariaLabel={title}
          onOpenAutoFocus={preventOpenAutoFocus}
          className='educational-tooltip-content bg-inverse-surface-0 radius-medium padding-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='13'
            height='6'
            viewBox='0 0 13 6'
            className='absolute inverse-surface-0'
            style={{
              top: '-5px',
              left: `${beakLeftOffset}px`,
              transform: 'rotate(180deg)'
            }}>
            <path
              d='M0.249999 0.666628L4.83579 5.25241C5.61683 6.03346 6.88316 6.03346 7.66421 5.25241L12.25 0.666626L0.249999 0.666628Z'
              style={{ fill: 'currentColor' }}
            />
          </svg>
          <div className='flex items-start justify-between gap-small'>
            <div className='flex flex-col gap-xsmall'>
              <div className='text-title-small content-inverse-default'>{title}</div>
              <div className='text-body-small content-inverse-default'>{description}</div>
            </div>
            <IconButton
              className='icon-button-inverse'
              variant='Utility'
              size='XSmall'
              icon='icon-regular-x'
              ariaLabel='Close'
              tabIndex={-1} // prevent autofocus on X button
              onClick={dismissTooltip}
            />
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default EducationalTooltip;
