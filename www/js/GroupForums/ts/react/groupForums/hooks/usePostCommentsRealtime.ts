import { useEffect, useMemo, useRef } from 'react';
import type { InfiniteData, QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { useRealtimeSubscription } from '../../shared/contexts/RealtimeContext';
import { ChannelHelper } from '../../shared/services/realtimeService';
import type { ForumsPayload } from '../../shared/utils/realtimeProxy';
import type { ForumComment, ForumCommentsResponse } from '../types';

type CommentsInfiniteData = InfiniteData<ForumCommentsResponse> | undefined;

type RefetchComments = (
  options?: RefetchOptions
) => Promise<QueryObserverResult<InfiniteData<ForumCommentsResponse>, unknown>>;

type RefetchPost = (options?: RefetchOptions) => Promise<unknown>;

type UsePostCommentsRealtimeParams = {
  groupId: number;
  categoryId: string | undefined;
  postId: string | undefined;
  realtimeMessagingEnabled: boolean;
  data: CommentsInfiniteData;
  refetchComments: RefetchComments;
  refetchPost: RefetchPost;
  setNewCommentIds: (ids: Set<string>) => void;
};

function flattenCommentsDeduped(data: InfiniteData<ForumCommentsResponse>): ForumComment[] {
  const seen = new Set<string>();
  const out: ForumComment[] = [];
  for (const page of data.pages) {
    for (const c of page.data) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        out.push(c);
      }
    }
  }
  return out;
}

export default function usePostCommentsRealtime({
  groupId,
  categoryId,
  postId,
  realtimeMessagingEnabled,
  data,
  refetchComments,
  refetchPost,
  setNewCommentIds
}: UsePostCommentsRealtimeParams): void {
  const hasSeededIdsRef = useRef(false);
  const prevAllCommentIdsRef = useRef<Set<string>>(new Set());
  const renderTimeRef = useRef(Date.now());

  useEffect(() => {
    hasSeededIdsRef.current = false;
    prevAllCommentIdsRef.current = new Set();
    renderTimeRef.current = Date.now();
  }, [groupId, categoryId, postId]);

  useEffect(() => {
    if (!data?.pages?.length) {
      return;
    }

    const flat = flattenCommentsDeduped(data);
    const allIds = new Set(flat.map(c => c.id));

    if (!hasSeededIdsRef.current) {
      hasSeededIdsRef.current = true;
      prevAllCommentIdsRef.current = allIds;
      return;
    }

    const prev = prevAllCommentIdsRef.current;
    const newcomers = flat.filter(c => !prev.has(c.id));

    if (newcomers.length > 0) {
      const threshold = renderTimeRef.current;
      const newForBanner = newcomers.filter(c => new Date(c.createdAt).getTime() > threshold);
      if (newForBanner.length > 0) {
        renderTimeRef.current = Math.max(
          threshold,
          ...newForBanner.map(c => new Date(c.createdAt).getTime())
        );
      }
      setNewCommentIds(new Set(newForBanner.map(c => c.id)));
    }

    prevAllCommentIdsRef.current = allIds;
  }, [data, setNewCommentIds]);

  const postRealtimeChannel = useMemo(
    () => (postId && realtimeMessagingEnabled ? ChannelHelper.post(groupId, postId) : null),
    [postId, realtimeMessagingEnabled, groupId]
  );

  useRealtimeSubscription(postRealtimeChannel, (messages: ForumsPayload[]) => {
    if (messages.length > 1) {
      // eslint-disable-next-line no-void
      void refetchComments();
      return;
    }
    const { forumCommentId } = messages[0] ?? {};
    if (!forumCommentId || !groupId || !categoryId || !postId) {
      return;
    }
    // eslint-disable-next-line no-void
    void refetchComments();
  });

  const postRealtimeReactionsChannel = useMemo(
    () =>
      postId && realtimeMessagingEnabled ? ChannelHelper.postReactions(groupId, postId) : null,
    [postId, realtimeMessagingEnabled, groupId]
  );

  useRealtimeSubscription(postRealtimeReactionsChannel, (messages: ForumsPayload[]) => {
    if (messages.length > 1) {
      // eslint-disable-next-line no-void
      void refetchComments();
      // eslint-disable-next-line no-void
      void refetchPost();
      return;
    }
    const { forumCommentId } = messages[0] ?? {};
    if (!forumCommentId || !groupId || !categoryId || !postId) {
      return;
    }
    // eslint-disable-next-line no-void
    void refetchComments();
    // eslint-disable-next-line no-void
    void refetchPost();
  });
}
