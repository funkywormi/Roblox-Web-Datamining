import React from 'react';
import { Button } from '@rbx/foundation-ui';
import ConditionalTooltip from '../ConditionalTooltip';

export type CreateContentButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: (() => void) | (() => Promise<void>);
  buttonId?: string;
  tooltipId?: string;
  tooltipContent?: string;
};

const CreateContentButton = ({
  label,
  disabled,
  onClick,
  buttonId = 'create-content-button',
  tooltipContent
}: CreateContentButtonProps): JSX.Element => {
  const tooltipId = `${buttonId}-tooltip`;

  return (
    <ConditionalTooltip
      id={tooltipId}
      content={tooltipContent}
      position='top-center'
      enabled={!!tooltipContent}
      containerClassName='groups-create-content-btn-tooltip-container'>
      <Button
        id={buttonId}
        type='button'
        variant='Emphasis'
        size='Medium'
        className='groups-create-content-btn'
        onClick={onClick}
        isDisabled={disabled}
        aria-describedby={tooltipContent ? tooltipId : undefined}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}>
        {label}
      </Button>
    </ConditionalTooltip>
  );
};

CreateContentButton.displayName = 'CreateContentButton';

export default CreateContentButton;
