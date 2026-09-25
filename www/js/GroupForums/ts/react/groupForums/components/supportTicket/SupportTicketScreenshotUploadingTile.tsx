import React from 'react';
import ImageUploadPreviewTile from '../../../shared/components/fileUpload/ImageUploadPreviewTile';

export type SupportTicketScreenshotUploadingTileProps = {
  index: number;
  /**
   * `data:` URL of the picked file, shown dimmed under the spinner. A data URL rather than an
   * object URL because the site's CSP `img-src` allows `data:` but not `blob:`.
   */
  previewUrl?: string;
  uploadingLabel: string;
};

const SupportTicketScreenshotUploadingTile = ({
  index,
  previewUrl,
  uploadingLabel
}: SupportTicketScreenshotUploadingTileProps): JSX.Element => (
  <ImageUploadPreviewTile
    className='support-ticket-screenshot-tile'
    testId={`support-ticket-screenshot-uploading-${index}`}
    previewUrl={previewUrl}
    isUploading
    uploadingLabel={uploadingLabel}
  />
);

SupportTicketScreenshotUploadingTile.displayName = 'SupportTicketScreenshotUploadingTile';

export default SupportTicketScreenshotUploadingTile;
