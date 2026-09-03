import React from 'react';
import { IconButton } from '@rbx/foundation-ui';
import classNames from 'classnames';

export type SupportTicketScreenshotPreviewTileProps = {
  previewUrl?: string;
  index: number;
  removeLabel: string;
  onRemove: () => void;
};

const SupportTicketScreenshotPreviewTile = ({
  previewUrl,
  index,
  removeLabel,
  onRemove
}: SupportTicketScreenshotPreviewTileProps): JSX.Element => (
  <div
    className={classNames('support-ticket-screenshot-tile', {
      'support-ticket-screenshot-tile-placeholder': !previewUrl
    })}
    data-testid={`support-ticket-screenshot-${index}`}>
    {previewUrl && (
      <img
        className='support-ticket-screenshot-preview support-ticket-screenshot-preview-complete'
        src={previewUrl}
        alt=''
      />
    )}
    <IconButton
      className='support-ticket-screenshot-remove'
      data-testid={`support-ticket-screenshot-remove-${index}`}
      icon='icon-regular-x'
      ariaLabel={removeLabel}
      size='XSmall'
      variant='OverMedia'
      isCircular
      onClick={onRemove}
    />
  </div>
);

SupportTicketScreenshotPreviewTile.displayName = 'SupportTicketScreenshotPreviewTile';

export default SupportTicketScreenshotPreviewTile;
