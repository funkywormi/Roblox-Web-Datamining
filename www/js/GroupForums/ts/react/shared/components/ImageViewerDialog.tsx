import React, { useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import {
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailFormat,
  ThumbnailTypes
} from 'roblox-thumbnails';

export type ImageViewerDialogProps = {
  assetId: number;
  onClose: () => void;
};

const ImageViewerDialog = ({ assetId, onClose }: ImageViewerDialogProps): JSX.Element => {
  const { translate } = useTranslation();
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog
      open
      onOpenChange={handleOpenChange}
      size='Large'
      type='Default'
      isModal
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent className='image-viewer-dialog'>
        <DialogTitle hidden>{translate('Label.Image')}</DialogTitle>
        <div className='image-viewer-dialog-frame'>
          <Thumbnail2d
            containerClass='image-viewer-dialog-thumbnail'
            targetId={assetId}
            size={ThumbnailAssetsSize.size700}
            format={ThumbnailFormat.png}
            type={ThumbnailTypes.assetThumbnail}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

ImageViewerDialog.displayName = 'ImageViewerDialog';

export default ImageViewerDialog;
