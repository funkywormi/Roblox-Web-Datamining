import React, { ChangeEvent, useRef } from 'react';
import { useTranslation } from 'react-utilities';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import ForumImageUploadPreviews from '../components/content/ForumImageUploadPreviews';
import type { AttachmentMenuItem } from '../components/content/PostComposerAttachmentMenu';
import { ChannelModerationType, ForumCategory } from '../types';
import { useForumImageUploads } from './useForumImageUploads';

type UseForumImageAttachmentsParams = {
  groupId: number;
  activeCategory?: ForumCategory;
  canCreateInActiveCategory: boolean;
  isEditing: boolean;
};

export type UseForumImageAttachmentsResult = {
  mediaAssetIds: number[];
  isSubmitBlocked: boolean;
  menuItem?: AttachmentMenuItem;
  contentFooter: React.ReactNode;
  input: React.ReactNode;
  reset: () => void;
};

const useForumImageAttachments = ({
  groupId,
  activeCategory,
  canCreateInActiveCategory,
  isEditing
}: UseForumImageAttachmentsParams): UseForumImageAttachmentsResult => {
  const { translate } = useTranslation();
  const { features } = useCommunityProductFeatures();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const canAttachImages =
    !isEditing &&
    canCreateInActiveCategory &&
    features.ForumsImages === true &&
    activeCategory?.isRestricted === true &&
    activeCategory.moderationType === ChannelModerationType.Unrestricted;

  const {
    images,
    assetIds,
    isSubmitBlocked,
    errorKey,
    errorMeta,
    remainingSlots,
    validation,
    addFiles,
    removeByKey,
    reset
  } = useForumImageUploads({
    groupId,
    categoryId: activeCategory?.id,
    enabled: canAttachImages
  });

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (input.files) {
      addFiles(input.files);
    }
    input.value = '';
  };

  const menuItem = canAttachImages
    ? {
        id: 'image',
        label: translate('Label.AddImage'),
        icon: 'icon-regular-image' as const,
        disabled: remainingSlots === 0,
        onSelect: () => imageInputRef.current?.click()
      }
    : undefined;

  return {
    mediaAssetIds: assetIds,
    isSubmitBlocked,
    menuItem,
    contentFooter: canAttachImages ? (
      <ForumImageUploadPreviews
        images={images}
        errorKey={errorKey}
        errorMeta={errorMeta}
        onRemove={removeByKey}
      />
    ) : null,
    input: canAttachImages ? (
      <input
        ref={imageInputRef}
        type='file'
        accept={validation.accept}
        multiple
        className='hidden'
        data-testid='forum-image-upload-input'
        onChange={handleImageSelection}
      />
    ) : null,
    reset
  };
};

export default useForumImageAttachments;
