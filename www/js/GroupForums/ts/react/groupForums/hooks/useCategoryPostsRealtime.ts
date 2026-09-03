import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import type { InfiniteData, QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { useRealtimeSubscription } from '../../shared/contexts/RealtimeContext';
import { ChannelHelper } from '../../shared/services/realtimeService';
import type { ForumsPayload } from '../../shared/utils/realtimeProxy';
import { uniqueForumPostIdsFromMessages } from '../utils/forumsRealtimePayload';
import collectRowIdsFromInfinitePages from '../utils/infiniteForumDataIds';
import type { ForumPostsResponse } from '../types';

type SetNewPostIds = Dispatch<SetStateAction<Set<string>>>;

type CategoryPostsInfiniteData = InfiniteData<ForumPostsResponse> | undefined;

type RefetchCategoryPosts = (
  options?: RefetchOptions
) => Promise<QueryObserverResult<InfiniteData<ForumPostsResponse>, unknown>>;

type UseCategoryPostsRealtimeParams = {
  groupId: number;
  categoryId: string;
  realtimeMessagingEnabled: boolean;
  data: CategoryPostsInfiniteData;
  refetchCategoryPosts: RefetchCategoryPosts;
  setNewPostIds: SetNewPostIds;
};

export default function useCategoryPostsRealtime({
  groupId,
  categoryId,
  realtimeMessagingEnabled,
  data,
  refetchCategoryPosts,
  setNewPostIds
}: UseCategoryPostsRealtimeParams): void {
  const hasSeededIdsRef = useRef(false);
  const prevAllPostIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    hasSeededIdsRef.current = false;
    prevAllPostIdsRef.current = new Set();
  }, [groupId, categoryId]);

  useEffect(() => {
    if (!data?.pages?.length) {
      return;
    }

    const allIds = collectRowIdsFromInfinitePages(data);
    const firstPageIds = data.pages[0].data.map(post => post.id);

    if (!hasSeededIdsRef.current) {
      hasSeededIdsRef.current = true;
      prevAllPostIdsRef.current = allIds;
      return;
    }

    const prev = prevAllPostIdsRef.current;
    const newIdsAtHead = firstPageIds.filter(id => !prev.has(id));
    if (newIdsAtHead.length > 0) {
      setNewPostIds(prevSet => new Set([...Array.from(prevSet), ...newIdsAtHead]));
    }

    prevAllPostIdsRef.current = allIds;
  }, [data, setNewPostIds]);

  const categoryRealtimeChannel = useMemo(
    () =>
      categoryId && realtimeMessagingEnabled ? ChannelHelper.category(groupId, categoryId) : null,
    [categoryId, realtimeMessagingEnabled, groupId]
  );

  useRealtimeSubscription(categoryRealtimeChannel, (messages: ForumsPayload[]) => {
    if (uniqueForumPostIdsFromMessages(messages).length === 0) {
      return;
    }
    // eslint-disable-next-line no-void
    void refetchCategoryPosts();
  });

  const categoryReactionsRealtimeChannel = useMemo(
    () =>
      categoryId && realtimeMessagingEnabled
        ? ChannelHelper.categoryReactions(groupId, categoryId)
        : null,
    [categoryId, realtimeMessagingEnabled, groupId]
  );

  useRealtimeSubscription(categoryReactionsRealtimeChannel, (messages: ForumsPayload[]) => {
    if (uniqueForumPostIdsFromMessages(messages).length === 0) {
      return;
    }
    // eslint-disable-next-line no-void
    void refetchCategoryPosts();
  });
}
