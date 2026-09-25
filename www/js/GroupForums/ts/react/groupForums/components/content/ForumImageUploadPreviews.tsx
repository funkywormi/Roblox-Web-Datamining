import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import ImageUploadPreviewTile from '../../../shared/components/fileUpload/ImageUploadPreviewTile';
import { ForumImageUpload, ForumImageUploadErrorMeta } from '../../hooks/useForumImageUploads';
import { groupsConfig as groupForumsTranslationConfig } from '../../translation.config';

export type ForumImageUploadPreviewsProps = {
  images: ForumImageUpload[];
  errorKey: string | null;
  errorMeta?: ForumImageUploadErrorMeta;
  onRemove: (key: number) => void;
};

const ForumImageUploadPreviews = ({
  images,
  errorKey,
  errorMeta,
  onRemove,
  translate
}: ForumImageUploadPreviewsProps & WithTranslationsProps): JSX.Element | null => {
  if (images.length === 0 && !errorKey) {
    return null;
  }

  const removeLabel = translate('Action.Remove');
  const uploadingLabel = translate('Message.Uploading');

  return (
    <div className='forum-image-upload-previews' data-testid='forum-image-upload-previews'>
      {images.length > 0 && (
        <div className='forum-image-upload-preview-tiles'>
          {images.map((image, index) => (
            <ImageUploadPreviewTile
              key={image.key}
              className='forum-image-upload-preview-tile'
              testId={`forum-image-upload-preview-${index}`}
              previewUrl={image.previewUrl}
              isUploading={image.status === 'uploading'}
              isFailed={image.status === 'failed'}
              uploadingLabel={uploadingLabel}
              removeLabel={removeLabel}
              onRemove={() => onRemove(image.key)}
            />
          ))}
        </div>
      )}
      {errorKey && (
        <span className='text-body-small text-error' data-testid='forum-image-upload-error'>
          {translate(errorKey, errorMeta)}
        </span>
      )}
    </div>
  );
};

ForumImageUploadPreviews.displayName = 'ForumImageUploadPreviews';

export default withTranslations(ForumImageUploadPreviews, groupForumsTranslationConfig);
