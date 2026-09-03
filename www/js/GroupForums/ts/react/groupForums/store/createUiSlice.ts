import { StateCreator } from 'zustand';
import { UiSlice } from './sliceTypes';
import { SetState } from '../../shared/stores/storeTypes';

const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set: SetState<UiSlice>) => ({
  useInlineReply: false,
  categoryId: undefined,
  categoryShortId: undefined,
  categoryName: undefined,
  isCategoryArchived: false,
  postId: undefined,
  postShortId: undefined,
  isPostInaccessible: false,
  commentId: undefined,
  activeCommentId: undefined,
  threadCommentId: undefined,
  newCommentIds: new Set(),
  returnToCategoryScrollTop: undefined,
  postRateLimitExpiresAt: 0,
  commentRateLimitExpiresAt: 0,
  setNewCommentIds: (newCommentIds: Set<string>) =>
    set(
      {
        newCommentIds
      },
      undefined,
      'ui/setNewCommentIds'
    ),
  setCategoryId: (categoryId: string) =>
    set(
      {
        categoryId
      },
      undefined,
      'ui/setCategoryId'
    ),
  setActiveCommentId: (activeCommentId?: string) =>
    set(
      {
        activeCommentId
      },
      undefined,
      'ui/setActiveCommentId'
    ),
  setReturnToCategoryScrollTop: (returnToCategoryScrollTop?: number) =>
    set(
      {
        returnToCategoryScrollTop
      },
      undefined,
      'ui/setReturnToCategoryScrollTop'
    ),
  setPostRateLimitExpiresAt: (postRateLimitExpiresAt?: number) =>
    set(
      {
        postRateLimitExpiresAt: postRateLimitExpiresAt ?? 0
      },
      undefined,
      'ui/setPostRateLimitExpiresAt'
    ),
  setCommentRateLimitExpiresAt: (commentRateLimitExpiresAt?: number) =>
    set(
      {
        commentRateLimitExpiresAt: commentRateLimitExpiresAt ?? 0
      },
      undefined,
      'ui/setCommentRateLimitExpiresAt'
    )
});

export default createUiSlice;
