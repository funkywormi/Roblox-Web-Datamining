import React from 'react';
import { Icon } from '../Icon';
import { Tooltip, TooltipTrigger, TTooltipProps } from '../Tooltip';

/**
 * Config for a label tooltip. `title` is pinned to `string` (not `Tooltip`'s
 * wider `ReactNode`) because it doubles as the info-icon's `aria-label`.
 */
export type TLabelTooltipConfig = { title: string } & Partial<
  Pick<TTooltipProps, 'description' | 'position'>
>;

/**
 * Info icon beside a field label; reveals a {@link Tooltip} on hover/focus.
 * Shared by `TextInput`, `Dropdown`, and `RadioGroup`.
 */
export const LabelTooltip = ({
  title,
  description,
  position = 'top-center'
}: TLabelTooltipConfig) => (
  <Tooltip position={position} title={title} description={description}>
    <TooltipTrigger asChild>
      <span
        role='button'
        tabIndex={0}
        aria-label={title}
        className='flex items-center content-muted'
        data-testid='label-tooltip-trigger'>
        <Icon name='icon-regular-circle-i' size='Small' />
      </span>
    </TooltipTrigger>
  </Tooltip>
);
