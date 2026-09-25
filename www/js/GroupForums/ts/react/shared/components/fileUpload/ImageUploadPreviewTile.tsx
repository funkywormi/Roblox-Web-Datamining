import React from 'react';
import classNames from 'classnames';
import { IconButton } from '@rbx/foundation-ui';
import {
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailFormat,
  ThumbnailTypes
} from 'roblox-thumbnails';
import InlineProgressLoader from '../InlineProgressLoader';

export type ImageUploadPreviewTileProps = {
  className?: string;
  testId: string;
  removeTestId?: string;
  previewUrl?: string;
  assetId?: number;
  isUploading?: boolean;
  isFailed?: boolean;
  uploadingLabel?: string;
  removeLabel?: string;
  onRemove?: () => void;
};

const ImageUploadPreviewTile = ({
  className,
  testId,
  removeTestId,
  previewUrl,
  assetId,
  isUploading = false,
  isFailed = false,
  uploadingLabel,
  removeLabel,
  onRemove
}: ImageUploadPreviewTileProps): JSX.Element => (
  <div
    className={classNames(
      'image-upload-preview-tile',
      isFailed && 'image-upload-preview-tile-failed stroke-standard stroke-system-alert',
      !previewUrl && !assetId && 'image-upload-preview-tile-placeholder',
      className
    )}
    data-testid={testId}>
    {previewUrl ? (
      <img
        className={classNames(
          'image-upload-preview-image',
          isUploading && 'image-upload-preview-image-uploading'
        )}
        src={previewUrl}
        alt=''
      />
    ) : (
      assetId && (
        <Thumbnail2d
          containerClass='image-upload-preview-thumbnail'
          targetId={assetId}
          size={ThumbnailAssetsSize.size150}
          format={ThumbnailFormat.png}
          type={ThumbnailTypes.assetThumbnail}
        />
      )
    )}
    {isUploading && (
      <span className='image-upload-preview-uploading-overlay'>
        <InlineProgressLoader
          variant='Indeterminate'
          size='Small'
          ariaLabel={uploadingLabel ?? ''}
        />
      </span>
    )}
    {onRemove && removeLabel && (
      <IconButton
        className='image-upload-preview-remove'
        data-testid={removeTestId ?? `${testId}-remove`}
        icon='icon-regular-x'
        ariaLabel={removeLabel}
        size='XSmall'
        variant='OverMedia'
        isCircular
        onClick={onRemove}
      />
    )}
  </div>
);

ImageUploadPreviewTile.displayName = 'ImageUploadPreviewTile';

export default ImageUploadPreviewTile;
