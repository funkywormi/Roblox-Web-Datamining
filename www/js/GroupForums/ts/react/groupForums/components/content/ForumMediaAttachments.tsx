import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { Thumbnail2d, ThumbnailAssetsSize, ThumbnailTypes } from 'roblox-thumbnails';
import AccessibleDivButton from '../../../shared/components/AccessibleDivButton';
import ImageViewerDialog from '../../../shared/components/ImageViewerDialog';
import type { MediaAttachment } from '../../types';

// Thumbnail2d marks placeholder containers with icon-* and loading images with `loading`.
const LOADED_THUMBNAIL_SELECTOR = ".thumbnail-2d-container:not([class*='icon-']) img:not(.loading)";

export const FORUM_MEDIA_ATTACHMENT_CLASS = 'forum-media-attachment';

export type ForumMediaAttachmentsProps = {
  attachments?: MediaAttachment[];
};

const ForumMediaAttachments = ({ attachments }: ForumMediaAttachmentsProps): JSX.Element | null => {
  const { translate } = useTranslation();
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const handleClose = useCallback(() => setSelectedAssetId(null), []);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <div className='forum-media-attachments' data-testid='forum-media-attachments'>
        {attachments.map(({ assetId }, index) => (
          <AccessibleDivButton
            key={assetId}
            className={FORUM_MEDIA_ATTACHMENT_CLASS}
            data-testid={`forum-media-attachment-${assetId}`}
            aria-label={`${translate('Label.Image')} ${index + 1}`}
            onClick={event => {
              if (event.currentTarget.querySelector(LOADED_THUMBNAIL_SELECTOR)) {
                setSelectedAssetId(assetId);
              }
            }}>
            <Thumbnail2d
              containerClass='forum-media-attachment-thumbnail'
              targetId={assetId}
              size={ThumbnailAssetsSize.size420}
              type={ThumbnailTypes.assetThumbnail}
            />
          </AccessibleDivButton>
        ))}
      </div>
      {selectedAssetId !== null && (
        <ImageViewerDialog assetId={selectedAssetId} onClose={handleClose} />
      )}
    </React.Fragment>
  );
};

ForumMediaAttachments.displayName = 'ForumMediaAttachments';

export default ForumMediaAttachments;
