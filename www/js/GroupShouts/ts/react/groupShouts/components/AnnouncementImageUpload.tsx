import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, Icon } from '@rbx/foundation-ui';
import {
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailFormat,
  ThumbnailTypes
} from 'roblox-thumbnails';
import type { WithTranslationsProps } from 'react-utilities';
import FileUploadBase from '../../shared/components/fileUpload/FileUploadBase';
import { FileValidationOptions } from '../../shared/components/fileUpload/types';
import { isImageFile } from '../../shared/components/fileUpload/utils/validation';
import InlineProgressLoader from '../../shared/components/InlineProgressLoader';
import AttachmentCard from '../../shared/components/AttachmentCard';

export type AnnouncementImageUploadProps = {
  onChange: (files: FileList) => void;
  onRemove: () => void;
  previewAssetId: number | null;
  validation: FileValidationOptions;
  isUploading: boolean;
  /** e.g. "930 × 480px"; interpolated into the helper copy. */
  displayDimensions: string;
  translate: WithTranslationsProps['translate'];
};

/**
 * Image item in the announcement composer. The whole card is a drop target and shows a dashed
 * highlight while a file is dragged over it. With no image, the trailing button opens the file
 * picker; once an image is set, it becomes a "Remove image" button (alongside the ✕ on the
 * preview). Remount via `key` to clear the local preview.
 */
const AnnouncementImageUpload: React.FC<AnnouncementImageUploadProps> = ({
  onChange,
  onRemove,
  previewAssetId,
  validation,
  isUploading,
  displayDimensions,
  translate
}) => {
  const [localPreviewSrc, setLocalPreviewSrc] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // dragenter/dragleave fire for every child the pointer crosses, so count them to know when
  // the drag has actually left the card.
  const dragDepthRef = useRef(0);
  // Bumped on every selection and remove. A slow read of an earlier file can finish after a newer
  // one, so only the latest read may set the preview; otherwise it would show a file that isn't
  // the one being uploaded.
  const selectionRef = useRef(0);

  const handleFilesChanged = (files: FileList) => {
    selectionRef.current += 1;
    const selection = selectionRef.current;
    const file = files?.[0];
    if (file && isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = e => {
        if (selection === selectionRef.current) setLocalPreviewSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    onChange(files);
  };

  const showAssetPreview = !!previewAssetId && !localPreviewSrc;
  const hasPreview = !!localPreviewSrc || showAssetPreview;

  const handleDragEnter = () => {
    dragDepthRef.current += 1;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragOver(false);
  };

  const resetDrag = () => {
    dragDepthRef.current = 0;
    setIsDragOver(false);
  };

  const handleRemoveClicked = (e: React.MouseEvent) => {
    // Keep the click from bubbling to the drop target and reopening the file picker.
    e.stopPropagation();
    selectionRef.current += 1;
    setLocalPreviewSrc(null);
    onRemove();
  };

  return (
    <FileUploadBase
      className='announcement-image-upload'
      onChange={handleFilesChanged}
      validation={validation}
      accept={validation.accept}
      blockOnValidationError>
      {(onClick, onKeyDown, onDrop, onDragOverOrEnter) => (
        <div
          className='announcement-image-upload-dropzone'
          data-testid='announcement-image-upload'
          onDrop={e => {
            resetDrag();
            onDrop(e);
          }}
          onDragOver={onDragOverOrEnter}
          onDragEnter={e => {
            handleDragEnter();
            onDragOverOrEnter(e);
          }}
          onDragLeave={handleDragLeave}>
          <AttachmentCard
            className={classNames(isDragOver && 'is-drag-over')}
            media={
              <div
                className={classNames(
                  'announcement-image-upload-preview',
                  isUploading && 'is-uploading'
                )}>
                {localPreviewSrc && (
                  <img className='announcement-image-upload-image' src={localPreviewSrc} alt='' />
                )}
                {showAssetPreview && (
                  <Thumbnail2d
                    containerClass='announcement-image-upload-image'
                    targetId={previewAssetId ?? 0}
                    size={ThumbnailAssetsSize.width930}
                    format={ThumbnailFormat.png}
                    type={ThumbnailTypes.assetThumbnail}
                  />
                )}
                {!hasPreview && (
                  <Icon name='icon-regular-image' size='Large' className='content-default' />
                )}
                {isUploading && (
                  <div className='announcement-image-upload-progress' aria-live='polite'>
                    <InlineProgressLoader
                      variant='Indeterminate'
                      size='Medium'
                      ariaLabel={translate('Message.Uploading')}
                    />
                  </div>
                )}
                {hasPreview && !isUploading && (
                  <button
                    type='button'
                    className='announcement-image-upload-remove'
                    aria-label={translate('Action.RemoveImage')}
                    data-testid='file-upload-remove'
                    onClick={handleRemoveClicked}>
                    <Icon name='icon-regular-x' size='Small' />
                  </button>
                )}
              </div>
            }
            title={translate('Label.DragImageOrUpload')}
            description={translate('Description.AnnouncementImageDimensions', {
              dimensions: displayDimensions
            })}
            action={
              hasPreview ? (
                <Button
                  variant='Standard'
                  size='Medium'
                  onClick={handleRemoveClicked}
                  isDisabled={isUploading}>
                  {translate('Action.RemoveImage')}
                </Button>
              ) : (
                <Button
                  variant='Standard'
                  size='Medium'
                  onClick={onClick}
                  onKeyDown={onKeyDown}
                  isDisabled={isUploading}>
                  <span className='attachment-card-button-content'>
                    <Icon name='icon-regular-arrow-up-from-line' size='Small' />
                    {translate('Action.UploadImage')}
                  </span>
                </Button>
              )
            }
          />
        </div>
      )}
    </FileUploadBase>
  );
};

AnnouncementImageUpload.displayName = 'AnnouncementImageUpload';

export default AnnouncementImageUpload;
