import React, { useState, useEffect, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import {
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailFormat,
  ThumbnailTypes
} from 'roblox-thumbnails';
import classNames from 'classnames';
import FileUploadBase from './FileUploadBase';
import { FileValidationOptions, ValidationError } from './types';
import { fileUploadConfig } from '../../translation.config';
import { isImageFile } from './utils/validation';
import useDeviceInfo from '../../hooks/useDeviceInfo';
import InlineProgressLoader from '../InlineProgressLoader';

const SEPARATOR = '-';
const PERIOD = '.';

export type FileUploadProps = {
  onChange?: ((files: FileList) => void) | null;
  validation?: FileValidationOptions;
  onValidationError?: (errors: ValidationError[]) => void;
  blockOnValidationError?: boolean;
  dragFileTextKey?: string;
  orTextKey?: string;
  selectFromComputerTextKey?: string;
  selectFromDeviceTextKey?: string;
  previewSrc?: string | null;
  previewAssetId?: number | null;
  fileName?: string | null;
  thumbnailSize?: ThumbnailAssetsSize;
  displayDimensions?: string;
  isUploading?: boolean;
  uploadingLabel?: string;
  /**
   * When provided and a preview is being shown, renders a remove button on top of the preview.
   * Invoked when the user clicks/activates it; the local preview + file name are cleared
   * internally before the callback fires.
   */
  onRemove?: () => void;
  removeButtonLabelKey?: string;
} & WithTranslationsProps;

const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  validation,
  onValidationError,
  blockOnValidationError,
  dragFileTextKey = 'Label.DragFile',
  orTextKey = 'Label.Or',
  selectFromComputerTextKey = 'Label.SelectFromComputer',
  selectFromDeviceTextKey = 'Label.SelectFromDevice',
  previewSrc = null,
  previewAssetId = null,
  fileName = null,
  thumbnailSize = ThumbnailAssetsSize.size420,
  displayDimensions = null,
  isUploading = false,
  onRemove,
  removeButtonLabelKey = 'Action.Remove',
  translate
}) => {
  const [localPreviewSrc, setLocalPreviewSrc] = useState<string | null>(previewSrc);
  const [localFileName, setLocalFileName] = useState<string | null>(fileName);
  const { isPhone } = useDeviceInfo();

  useEffect(() => {
    setLocalPreviewSrc(previewSrc);
  }, [previewSrc]);

  useEffect(() => {
    setLocalFileName(fileName);
  }, [fileName]);

  const handleFilesChanged = (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];

      // Generate preview for images
      if (isImageFile(file)) {
        const reader = new FileReader();
        reader.onload = e => {
          setLocalPreviewSrc(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      setLocalFileName(file.name);
    }

    if (onChange) {
      onChange(files);
    }
  };

  const showAssetPreview = useMemo(() => {
    return !!(previewAssetId && !localPreviewSrc);
  }, [previewAssetId, localPreviewSrc]);

  const displayPreviewSrc = localPreviewSrc || previewSrc;
  const displayFileName = localFileName || fileName;

  const hasPreview = !!displayPreviewSrc || showAssetPreview;
  const showRemoveButton = !!onRemove && hasPreview && !isUploading;

  const handleRemoveClicked = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Stop the click from also hitting the sibling dropzone and opening the file picker.
    e.stopPropagation();
    setLocalPreviewSrc(null);
    setLocalFileName(null);
    onRemove?.();
  };

  return (
    <FileUploadBase
      onChange={handleFilesChanged}
      validation={validation}
      onValidationError={onValidationError}
      blockOnValidationError={blockOnValidationError}>
      {(
        onClick: () => void,
        onKeyDown: (e: React.KeyboardEvent | React.SyntheticEvent) => void,
        onDrop: (e: React.DragEvent) => void,
        onDragOverOrEnter: (e: React.DragEvent) => void
      ) => (
        <div className='file-upload-content'>
          <div
            className={classNames(
              `thumbnail-holder asset-thumb-container image-wrapper contain relative`,
              (localPreviewSrc || showAssetPreview) && 'has-image',
              isUploading && 'is-uploading'
            )}>
            {displayPreviewSrc && !showAssetPreview && (
              <img className='image' src={displayPreviewSrc} alt='Preview' />
            )}
            {showAssetPreview && (
              <div className='file-upload-preview-aspect-ratio-wrapper'>
                <Thumbnail2d
                  containerClass='file-upload-preview-thumbnail'
                  targetId={previewAssetId ?? 0}
                  size={thumbnailSize}
                  format={ThumbnailFormat.png}
                  type={ThumbnailTypes.assetThumbnail}
                />
              </div>
            )}

            {isUploading && (
              <div className='file-upload-progress-overlay' aria-live='polite'>
                <InlineProgressLoader
                  variant='Indeterminate'
                  size='Medium'
                  ariaLabel={translate('Message.Uploading')}
                />
              </div>
            )}

            {displayFileName && (
              <div className='preview-overlay'>
                <div className='font-caption-header preview-text text-overflow'>
                  {displayFileName}
                </div>
              </div>
            )}

            {showRemoveButton && (
              <button
                type='button'
                className='file-upload-remove-button'
                aria-label={translate(removeButtonLabelKey)}
                data-testid='file-upload-remove'
                onClick={handleRemoveClicked}>
                <span className='icon-close' aria-hidden='true' />
              </button>
            )}
          </div>

          <div
            className='dropzone'
            role='button'
            tabIndex={0}
            onClick={onClick}
            onKeyDown={onKeyDown}
            onDrop={onDrop}
            onDragOver={onDragOverOrEnter}
            onDragEnter={onDragOverOrEnter}
            aria-label={translate(dragFileTextKey)}
          />

          <div className='instruction-container'>
            {!isPhone && (
              <React.Fragment>
                <p className='instruction-text'>
                  {translate(dragFileTextKey)}
                  {PERIOD}{' '}
                  {displayDimensions &&
                    translate('Message.DisplayDimensions', {
                      dimensions: displayDimensions
                    })}
                </p>
                <p className='text-on-line'>
                  {SEPARATOR} <span>{translate(orTextKey)}</span> {SEPARATOR}
                </p>
              </React.Fragment>
            )}

            <Button
              className='file-btn'
              size='Small'
              variant='Standard'
              color='secondary'
              onClick={onClick}
              onKeyDown={onKeyDown}
              tabIndex={0}>
              {isPhone ? translate(selectFromDeviceTextKey) : translate(selectFromComputerTextKey)}
            </Button>
          </div>
        </div>
      )}
    </FileUploadBase>
  );
};

FileUpload.displayName = 'FileUpload';

export default withTranslations(FileUpload, fileUploadConfig);
