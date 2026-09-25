import React from 'react';
import ImageUploadPreviewTile from '../../../shared/components/fileUpload/ImageUploadPreviewTile';

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
  <ImageUploadPreviewTile
    className='support-ticket-screenshot-tile'
    testId={`support-ticket-screenshot-${index}`}
    removeTestId={`support-ticket-screenshot-remove-${index}`}
    previewUrl={previewUrl}
    removeLabel={removeLabel}
    onRemove={onRemove}
  />
);

SupportTicketScreenshotPreviewTile.displayName = 'SupportTicketScreenshotPreviewTile';

export default SupportTicketScreenshotPreviewTile;
