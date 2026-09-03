import React from 'react';
import classNames from 'classnames';
import InlineProgressLoader from '../../../shared/components/InlineProgressLoader';

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
  <div
    className={classNames('support-ticket-screenshot-tile', {
      // Without a preview behind it the tile reads as an empty slot instead.
      'support-ticket-screenshot-tile-placeholder': !previewUrl
    })}
    data-testid={`support-ticket-screenshot-uploading-${index}`}>
    {previewUrl && <img className='support-ticket-screenshot-preview' src={previewUrl} alt='' />}
    <span className='support-ticket-screenshot-uploading-overlay'>
      <InlineProgressLoader variant='Indeterminate' size='Small' ariaLabel={uploadingLabel} />
    </span>
  </div>
);

SupportTicketScreenshotUploadingTile.displayName = 'SupportTicketScreenshotUploadingTile';

export default SupportTicketScreenshotUploadingTile;
