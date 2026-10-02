import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import ForumImageUploadPreviews from '../components/content/ForumImageUploadPreviews';
import type { AttachmentMenuItem } from '../components/content/PostComposerAttachmentMenu';
import { ChannelModerationType, ForumCategory, ForumComment } from '../types';
import { ForumImageUpload, useForumImageUploads } from './useForumImageUploads';

type UseForumImageAttachmentsParams = {
  groupId: number;
  activeCategory?: ForumCategory;
  canCreateInActiveCategory: boolean;
  isEditing: boolean;
  editingComment?: ForumComment;
};

export type UseForumImageAttachmentsResult = {
  // Undefined for an edit that leaves the saved images unchanged.
  mediaAssetIds?: number[];
  hasUnsavedImageChanges: boolean;
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
  isEditing,
  editingComment
}: UseForumImageAttachmentsParams): UseForumImageAttachmentsResult => {
  const { translate } = useTranslation();
  const { features } = useCommunityProductFeatures();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isForumsImagesEnabled = features.ForumsImages === true;
  // groups-api rejects edits that add images, so edits can only remove saved ones for now.
  const canAttachImages =
    !isEditing &&
    canCreateInActiveCategory &&
    isForumsImagesEnabled &&
    activeCategory?.isRestricted === true &&
    activeCategory.moderationType === ChannelModerationType.Unrestricted;
  const canRemoveSavedImages = isEditing && isForumsImagesEnabled;

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
    reset: resetUploads
  } = useForumImageUploads({
    groupId,
    categoryId: activeCategory?.id,
    enabled: canAttachImages
  });

  const [removedAssetIds, setRemovedAssetIds] = useState<number[]>([]);
  useEffect(() => {
    setRemovedAssetIds([]);
  }, [editingComment?.id]);

  const savedAssetIds = canRemoveSavedImages
    ? (editingComment?.mediaAttachments ?? []).map(({ assetId }) => assetId)
    : [];
  const keptAssetIds = savedAssetIds.filter(assetId => !removedAssetIds.includes(assetId));
  const savedImages: ForumImageUpload[] = keptAssetIds.map(assetId => ({
    key: assetId,
    assetId,
    status: 'uploaded'
  }));
  const removeSavedImage = (assetId: number) =>
    setRemovedAssetIds(previous => [...previous, assetId]);

  const hasUnsavedImageChanges =
    isEditing && (keptAssetIds.length < savedAssetIds.length || assetIds.length > 0);
  let mediaAssetIds: number[] | undefined = assetIds;
  if (isEditing) {
    mediaAssetIds = hasUnsavedImageChanges ? [...keptAssetIds, ...assetIds] : undefined;
  }

  const reset = useCallback(() => {
    resetUploads();
    setRemovedAssetIds([]);
  }, [resetUploads]);

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

  const previewImages = isEditing ? savedImages : images;
  const removePreviewImage = isEditing ? removeSavedImage : removeByKey;
  // The rich-text editor shrinks its reserved rows for any footer, so pass one only when it
  // renders something.
  const hasPreviews = previewImages.length > 0 || errorKey !== null;

  return {
    mediaAssetIds,
    hasUnsavedImageChanges,
    isSubmitBlocked,
    menuItem,
    contentFooter:
      (canAttachImages || canRemoveSavedImages) && hasPreviews ? (
        <ForumImageUploadPreviews
          images={previewImages}
          errorKey={errorKey}
          errorMeta={errorMeta}
          onRemove={removePreviewImage}
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
