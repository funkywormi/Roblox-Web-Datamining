import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ForumComment,
  ForumCommentsResponse,
  ForumPost,
  NotificationPreferenceType,
  PostState
} from '../types';
import forumsService from '../services/forumsService';
import groupForumsConstants from '../constants/groupForumsConstants';
import { CompareComments } from '../utils/typeComparison';
import useForumStore from '../hooks/useForumStore';
import useRouteValidation from '../hooks/useRouteValidation';
import { getCommentRepliesKey, getPostCommentsKey, getPostKey } from '../services/queryKeys';
import { MessageContent } from '../../shared/types';

export const PostContext = createContext<PostState | undefined>(undefined);

export const usePost = (): PostState => {
  const resource = useContext(PostContext);
  if (!resource) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return resource;
};

export type PostProviderProps = {
  children: React.ReactNode;
};

const markPostAsRead = async (
  postGroupId: number,
  postCategoryId: string,
  Id: string,
  lastSeenCommentId: string
) => {
  try {
    await forumsService.markGroupForumPostAsRead(
      postGroupId,
      postCategoryId,
      Id,
      lastSeenCommentId
    );
  } catch {
    // Intentionally ignoring errors here because marking the post as read is non-critical
    // and should not block the user experience if it fails.
  }
};

export function PostProvider({ children }: PostProviderProps): JSX.Element {
  const groupId = useForumStore.use.groupId();
  const categoryId = useForumStore.use.categoryId()!;
  const postId = useForumStore.use.postId()!;
  const postShortId = useForumStore.use.postShortId()!;
  const routeCommentId = useForumStore.use.commentId()!;
  const setActiveCommentId = useForumStore.use.setActiveCommentId();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingPost,
    error: loadingPostError,
    data: post,
    refetch: fetchPost
  } = useQuery({
    queryKey: getPostKey(groupId, categoryId, postId),
    queryFn: async () => {
      const response = await forumsService.getGroupForumPostsByIds(groupId, categoryId, [
        postShortId
      ]);
      return response.data[0] as ForumPost | null;
    },
    enabled: !!groupId && !!categoryId && !!postShortId
  });

  useRouteValidation(!!post, post?.name ?? '');

  const onAddComments = useCallback(
    async (newItems: ForumComment[]) => {
      // Mark latest comment as last seen
      const lastCommentId = newItems[newItems.length - 1]?.id;
      if (lastCommentId) {
        await markPostAsRead(groupId, categoryId, postId, lastCommentId);
      }
    },
    [categoryId, groupId, postId]
  );

  const postCommentsQueryKey = getPostCommentsKey(
    groupId,
    categoryId,
    postId,
    routeCommentId ?? post?.firstComment.id
  );

  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isFetchingNextPage: isFetchingNextCommentsPage,
    isFetchingPreviousPage: isFetchingPreviousCommentsPage,
    error: commentsError,
    hasNextPage: hasNextCommentsPage,
    refetch: refetchComments,
    fetchNextPage: fetchNextCommentsPage,
    fetchPreviousPage: fetchPreviousCommentsPage
  } = useInfiniteQuery({
    retry: 1,
    queryKey: postCommentsQueryKey,
    queryFn: ({ pageParam }) =>
      forumsService.getGroupForumComments(
        groupId,
        categoryId,
        postId,
        groupForumsConstants.pageCounts.commentsPerPage,
        pageParam ?? null,
        // use first comment ID to fetch comments in ascending chrono order
        // we can remove this if we change default API behavior
        routeCommentId ?? post?.firstComment.id
      ),
    getNextPageParam: (lastPage: ForumCommentsResponse) => lastPage.nextPageCursor,
    getPreviousPageParam: (firstPage: ForumCommentsResponse) => firstPage.previousPageCursor,
    enabled: !isLoadingPost && !!categoryId && !!postId,
    onSuccess: data => {
      const newComments: ForumComment[] = data.pages.reduce(
        (comments: ForumComment[], response) => comments.concat(response.data),
        []
      );
      // eslint-disable-next-line no-void
      void onAddComments(newComments);
    }
  });

  // Transform infinite query data to match useCursoredData structure
  const comments = useMemo(() => {
    const allComments =
      commentsData?.pages.reduce((acc: ForumComment[], page: ForumCommentsResponse) => {
        return acc.concat(page.data);
      }, []) ?? [];

    // Remove duplicates by keeping only the first occurrence of each comment ID
    const seenIds = new Set<string>();
    return allComments.filter((comment: ForumComment) => {
      if (seenIds.has(comment.id)) {
        return false;
      }
      seenIds.add(comment.id);
      return true;
    });
  }, [commentsData]);

  const errorLoadingComments = !!commentsError;
  const hasNextComments = !!hasNextCommentsPage;

  const addComments = useCallback(
    ({ newItems }: { newItems: ForumComment[] }) => {
      // eslint-disable-next-line no-void
      void onAddComments(newItems);

      // Manually add new comments to the last page to show them immediately
      queryClient.setQueryData(
        postCommentsQueryKey,
        (oldData: InfiniteData<ForumCommentsResponse> | undefined) => {
          if (!oldData || oldData.pages.length === 0) {
            // Create initial data structure if no data exists
            return {
              pages: [
                {
                  data: newItems,
                  nextPageCursor: '',
                  previousPageCursor: ''
                }
              ],
              pageParams: [null]
            };
          }

          const newPages = [...oldData.pages];
          const lastPageIndex = newPages.length - 1;
          const lastPage = newPages[lastPageIndex];

          // Add new comments to the last page
          newPages[lastPageIndex] = {
            ...lastPage,
            data: [...lastPage.data, ...newItems]
          };

          return {
            ...oldData,
            pages: newPages
          };
        }
      );
    },
    [onAddComments, queryClient, postCommentsQueryKey]
  );

  const updateComment = useCallback(
    (updatedComment: ForumComment) => {
      queryClient.setQueryData(
        postCommentsQueryKey,
        (oldData: InfiniteData<ForumCommentsResponse> | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: ForumCommentsResponse) => ({
              ...page,
              data: page.data.map((comment: ForumComment) =>
                CompareComments(comment, updatedComment) ? updatedComment : comment
              )
            }))
          };
        }
      );
    },
    [queryClient, postCommentsQueryKey]
  );

  const hasPreviousComments = useMemo(() => {
    if (!post) return false;
    const firstCommentId = post.firstComment.id;
    return !comments.some(comment => comment.id === firstCommentId);
  }, [post, comments]);

  const getComment = useCallback(
    (commentId: string, parentCommentId?: string): ForumComment | null => {
      let searchComments = comments;
      if (parentCommentId) {
        const parentComment = comments.find(c => c.id === parentCommentId);
        if (parentComment) {
          const queryKey = getCommentRepliesKey(groupId, categoryId, parentComment.threadId!);
          const repliesCache = queryClient.getQueryData<InfiniteData<ForumCommentsResponse>>(
            queryKey
          );
          const pages = repliesCache?.pages || [];
          searchComments = pages.reduce(
            (acc, response) => acc.concat(response.data),
            [] as ForumComment[]
          );
        } else {
          return null;
        }
      }
      const comment = searchComments.find(c => c.id === commentId);
      if (comment) {
        return comment;
      }
      return null;
    },
    [categoryId, comments, groupId, queryClient]
  );

  const removeComment = useCallback(
    (commentId: string) => {
      queryClient.setQueryData(
        postCommentsQueryKey,
        (oldData: InfiniteData<ForumCommentsResponse> | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: ForumCommentsResponse) => ({
              ...page,
              data: page.data.filter((comment: ForumComment) => comment.id !== commentId)
            }))
          };
        }
      );
    },
    [queryClient, postCommentsQueryKey]
  );

  const editComment = useCallback(
    (updatedComment: ForumComment) => {
      updateComment(updatedComment);
    },
    [updateComment]
  );

  const editReply = useCallback(
    (updatedComment: ForumComment, parentCommentId: string) => {
      const parentComment = comments.find(c => c.id === parentCommentId);
      if (!parentComment) {
        return;
      }
      const threadKey = getCommentRepliesKey(groupId, categoryId, updatedComment.parentId);
      queryClient.setQueryData(
        threadKey,
        (oldData: InfiniteData<ForumCommentsResponse> | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: ForumCommentsResponse) => ({
              ...page,
              data: page.data.map((comment: ForumComment) => {
                return CompareComments(comment, updatedComment) ? updatedComment : comment;
              })
            }))
          };
        }
      );
    },
    [comments, updateComment]
  );

  const handleCreateComment = useCallback(
    async ({
      content,
      parentCommentId,
      mentioningReplyId
    }: {
      content: MessageContent;
      parentCommentId?: string;
      mentioningReplyId?: string;
    }): Promise<void> => {
      let repliesToCommentId = parentCommentId;
      if (parentCommentId === post?.firstComment.id) {
        repliesToCommentId = undefined;
      }
      const response = await forumsService.createGroupForumComment(
        groupId,
        categoryId,
        postId,
        content,
        repliesToCommentId
      );
      setActiveCommentId(response.id);
      if (repliesToCommentId) {
        const parentComment = getComment(repliesToCommentId);
        const queryKey = getCommentRepliesKey(groupId, categoryId, parentComment?.threadId || '');
        const repliesCache = queryClient.getQueryData<InfiniteData<ForumCommentsResponse>>(
          queryKey
        );
        if (repliesCache) {
          let wasInserted = false;
          const updatedList: ForumCommentsResponse[] =
            repliesCache.pages.map(page => ({
              ...page,
              data: page.data.reduce((acc, comment) => {
                acc.push(comment);
                if (comment.id === mentioningReplyId) {
                  // insert the reply directly after the reply it is replying to until refresh
                  wasInserted = true;
                  acc.push(response);
                }

                return acc;
              }, [] as ForumComment[])
            })) ?? [];
          if (!wasInserted) {
            // insert it at the bottom
            updatedList[0].data.push(response);
          }

          queryClient.setQueryData(
            queryKey,
            (data: InfiniteData<ForumCommentsResponse> | undefined) =>
              ({
                pages: updatedList,
                pageParams: data?.pageParams
              } as InfiniteData<ForumCommentsResponse>)
          );
        } else if (parentComment) {
          const updatedComment = { ...parentComment };
          updatedComment.threadComments = {
            comments: [response],
            nextPageCursor: '',
            previousPageCursor: '',
            hasMore: false
          };
          updatedComment.threadId = response.parentId;
          updateComment(updatedComment);
        }
      } else {
        addComments({ newItems: [response] });
      }
    },
    [
      post,
      groupId,
      categoryId,
      postId,
      getComment,
      addComments,
      queryClient,
      updateComment,
      setActiveCommentId
    ]
  );

  const handleEditComment = useCallback(
    async ({
      content,
      commentId,
      parentCommentId
    }: {
      content: MessageContent;
      commentId: string;
      parentCommentId?: string;
    }): Promise<void> => {
      const threadId = parentCommentId ? getComment(parentCommentId)?.threadId : undefined;
      const channelId = threadId ?? postId;
      const response = await forumsService.updateGroupForumComment(
        groupId,
        categoryId,
        channelId,
        commentId,
        content
      );
      if (parentCommentId) {
        editReply(response, parentCommentId);
      } else {
        // edit response does not include replies, so keep any loaded replies from original comment
        if (!response.replies?.length) {
          response.replies = getComment(commentId)?.replies ?? [];
        }
        editComment(response);
      }
    },
    [categoryId, groupId, postId, getComment, editComment, editReply]
  );

  const handleDeleteComment = useCallback(
    async (
      commentId: string,
      parentCommentId?: string,
      preventSimilar = false
    ): Promise<boolean> => {
      try {
        let channelId = postId;
        // If we are deleting a reply we send in the thread id as the channel id
        if (parentCommentId) {
          const parentComment = comments.find(c => c.id === parentCommentId);
          if (!parentComment) {
            return false;
          }
          if (!parentComment.threadId) {
            return false;
          }
          channelId = parentComment.threadId;
        }
        await forumsService.deleteGroupForumComment(
          groupId,
          categoryId,
          channelId,
          commentId,
          preventSimilar
        );
        if (!parentCommentId) {
          removeComment(commentId);
        }
      } catch (error) {
        return false;
      }
      return true;
    },
    [postId, groupId, categoryId, comments, removeComment]
  );

  const fetchPostNotificationPreference = useCallback(async () => {
    if (!post) {
      return;
    }
    const result = await forumsService.getPostNotificationPreference(groupId, categoryId, postId);
    const updatedPost = { ...post, notificationPreference: result.preference };
    queryClient.setQueryData(getPostKey(groupId, categoryId, postId), updatedPost);
  }, [categoryId, groupId, postId, post, queryClient]);

  const fetchCommentNotificationPreference = useCallback(
    async commentId => {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) {
        return;
      }

      const result = await forumsService.getCommentNotificationPreference(
        groupId,
        categoryId,
        postId,
        commentId
      );

      const updatedComment = { ...comment, notificationPreference: result.preference };

      updateComment(updatedComment);
    },
    [categoryId, comments, groupId, postId, updateComment]
  );

  const togglePostNotifications = useCallback(async () => {
    if (!post) {
      return;
    }

    const { notificationPreference } = post;
    const newIsSubscribed =
      !notificationPreference || notificationPreference === NotificationPreferenceType.None;

    await forumsService.togglePostNotificationSubscription(
      groupId,
      categoryId,
      postId,
      newIsSubscribed
    );

    const updatedPost = {
      ...post,
      notificationPreference: newIsSubscribed
        ? NotificationPreferenceType.All
        : NotificationPreferenceType.None
    };
    queryClient.setQueryData(getPostKey(groupId, categoryId, postId), updatedPost);
  }, [groupId, categoryId, postId, post, queryClient]);

  const toggleCommentNotifications = useCallback(
    async (commentId: string) => {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) {
        return;
      }

      const { notificationPreference } = comment;
      const newIsSubscribed = notificationPreference === NotificationPreferenceType.None;

      await forumsService.toggleCommentNotificationSubscription(
        groupId,
        categoryId,
        postId,
        commentId,
        newIsSubscribed
      );

      const updatedComment = {
        ...comment,
        notificationPreference: newIsSubscribed
          ? NotificationPreferenceType.All
          : NotificationPreferenceType.None
      };
      updateComment(updatedComment);
    },
    [groupId, categoryId, postId, comments, updateComment]
  );

  useEffect(() => {
    // `fetchPost` is TanStack Query's `refetch`, which bypasses the useQuery
    // `enabled` gate; without mirroring its guard here, navigating to a
    // category page (or hash-bouncing through one) fires queryFn while
    // `postShortId` is undefined, and [undefined].join(',') === '' produces
    // a GET /posts?postIds= with an empty postIds param.
    if (!categoryId || !postShortId) return;

    // eslint-disable-next-line no-void
    void fetchPost();
  }, [fetchPost, categoryId, postShortId]);

  useEffect(() => {
    // wait until post is loaded so we have the first comment id
    // can remove this check if we change API default to fetch comments in ascending chrono order
    // `refetchComments` bypasses the useInfiniteQuery `enabled` gate, so mirror its
    // `postId` guard here — otherwise navigating before `postId` resolves fires a
    // GET /posts/undefined/comments (post not found / comment permalink / hard refresh).
    if (!isLoadingPost && categoryId && postId) {
      // eslint-disable-next-line no-void
      void refetchComments();
    }
    // refetchComments was updating when it shouldn't have
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingPost, categoryId]);

  return (
    <PostContext.Provider
      value={{
        isLoadingPost,
        loadingPostError: !!loadingPostError,
        fetchPost,
        post: post ?? null,
        postCommentsQueryKey,
        handleCreateComment,
        handleEditComment,
        isLoadingComments,
        refetchComments,
        isFetchingNextCommentsPage,
        isFetchingPreviousCommentsPage,
        fetchNextCommentsPage,
        fetchPreviousCommentsPage,
        fetchPostNotificationPreference,
        fetchCommentNotificationPreference,
        togglePostNotifications,
        toggleCommentNotifications,
        errorLoadingComments,
        commentsInfiniteData: commentsData,
        comments,
        getComment,
        handleDeleteComment,
        removeComment,
        hasNextComments,
        hasPreviousComments
      }}>
      {children}
    </PostContext.Provider>
  );
}
