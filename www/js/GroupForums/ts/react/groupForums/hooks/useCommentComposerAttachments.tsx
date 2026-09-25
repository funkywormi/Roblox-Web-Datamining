import React, { useMemo } from 'react';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import PostComposerAttachmentMenu from '../components/content/PostComposerAttachmentMenu';
import useForumStore from './useForumStore';
import useForumImageAttachments, {
  UseForumImageAttachmentsResult
} from './useForumImageAttachments';

type UseCommentComposerAttachmentsResult = Omit<UseForumImageAttachmentsResult, 'menuItem'> & {
  leadingControl: React.ReactNode;
};

const useCommentComposerAttachments = (
  isEditing: boolean,
  disabled = false
): UseCommentComposerAttachmentsResult => {
  const groupId = useForumStore.use.groupId();
  const categoryId = useForumStore.use.categoryId();
  const categories = useForumStore.use.categories();
  const { canCreateComment } = useForumPermissions();
  const activeCategory = useMemo(() => categories.find(category => category.id === categoryId), [
    categories,
    categoryId
  ]);

  const { menuItem, ...imageAttachments } = useForumImageAttachments({
    groupId,
    activeCategory,
    canCreateInActiveCategory: canCreateComment && !disabled,
    isEditing
  });

  return {
    ...imageAttachments,
    leadingControl: menuItem ? <PostComposerAttachmentMenu items={[menuItem]} /> : null
  };
};

export default useCommentComposerAttachments;
