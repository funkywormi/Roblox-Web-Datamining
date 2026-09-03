import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Chip } from '@rbx/foundation-ui';
import classNames from 'classnames';
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { ForumPost, ForumPostsResponse, NotificationPreferenceType } from '../types';
import { groupsConfig } from '../translation.config';
import forumsService from '../services/forumsService';
import PostPreview from '../components/PostPreview';
import PostPreviewSkeleton from '../components/skeletons/PostPreviewSkeleton';
import groupForumsConstants from '../constants/groupForumsConstants';
import InfiniteLoader from '../../shared/components/InfiniteLoader';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import { ComparePost } from '../utils/typeComparison';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import useForumStore from '../hooks/useForumStore';
import useCategoryPostsRealtime from '../hooks/useCategoryPostsRealtime';
import { getCategoryPinnedPostsKey, getCategoryPostsKey } from '../services/queryKeys';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import Messages from '../components/Messages';

export type PostPreviewListProps = {} & WithTranslationsProps;

const PostPreviewList = ({ translate }: PostPreviewListProps): JSX.Element => {
  const groupId = useForumStore.use.groupId();
  const categoryId = useForumStore.use.categoryId()!;
  const categoryName = useForumStore.use.categoryName()!;
  const categoryShortId = useForumStore.use.categoryShortId()!;
  const returnToCategoryScrollTop = useForumStore.use.returnToCategoryScrollTop();
  const setReturnToCategoryScrollTop = useForumStore.use.setReturnToCategoryScrollTop();
  const blockedUserList = useForumStore.use.blockedUserList();
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const [hasScrolledPastFirstViewport, setHasScrolledPastFirstViewport] = useState(() => {
    if (typeof document === 'undefined') {
      return false;
    }
    const root = document.documentElement;
    return root.scrollTop > root.clientHeight;
  });

  const isReady = useMemo(() => !!(groupId && categoryId), [categoryId, groupId]);
  const queryClient = useQueryClient();
  const { systemFeedbackService } = useSystemFeedback();
  const { canCreatePost } = useForumPermissions();
  const { features } = useCommunityProductFeatures();

  const onScrollAnimationComplete = useCallback((postId: string) => {
    setNewPostIds(prev => {
      const updated = new Set(prev);
      updated.delete(postId);
      return updated;
    });
  }, []);

  // load category pinned posts
  const {
    isLoading: isLoadingPinnedPosts,
    data: pinnedCategoryResponse,
    refetch: refetchPinnedCategoryPosts
  } = useQuery({
    queryKey: getCategoryPinnedPostsKey(groupId, categoryId),
    queryFn: async ({ queryKey }) => {
      const [, queryGroupId, queryCategoryId] = queryKey;
      return forumsService.getGroupForumPinnedPosts(queryGroupId, queryCategoryId);
    },
    onError: () => systemFeedbackService.warning(translate('NetworkError')),
    enabled: isReady
  });

  // infinite load category posts
  const {
    isLoading,
    isFetchingNextPage,
    data: categoryPostResponse,
    fetchNextPage: fetchNextPostPage,
    hasNextPage,
    error: errorLoadingPosts,
    refetch: refetchCategoryPosts
  } = useInfiniteQuery({
    retry: 1,
    queryKey: getCategoryPostsKey(groupId, categoryId),
    queryFn: async ({ queryKey, pageParam: cursor }) => {
      const [, queryGroupId, queryCategoryId] = queryKey;
      const response = await forumsService.getGroupForumPosts(
        queryGroupId,
        queryCategoryId,
        groupForumsConstants.pageCounts.postsPerPage,
        cursor
      );

      // filter pinned posts
      response.data = response.data.filter(post => !post.isPinned);
      return response;
    },
    getNextPageParam: (lastPage: ForumPostsResponse) => lastPage.nextPageCursor || undefined,
    enabled: isReady
  });

  useCategoryPostsRealtime({
    groupId,
    categoryId,
    realtimeMessagingEnabled: !!features.RealtimeMessaging,
    data: categoryPostResponse,
    refetchCategoryPosts,
    setNewPostIds
  });

  const pinnedCategoryPosts = useMemo(() => pinnedCategoryResponse?.data || [], [
    pinnedCategoryResponse
  ]);

  const categoryPosts = useMemo(() => {
    const pages = categoryPostResponse ? categoryPostResponse.pages : [];
    return pages.reduce((acc, response) => acc.concat(response.data), [] as ForumPost[]);
  }, [categoryPostResponse]);

  const isConcealmentEnabled = features.ForumConcealment;

  const visiblePosts = useMemo(
    () =>
      categoryPosts
        .filter(post => !(blockedUserList.length > 0 && blockedUserList.includes(post.createdBy)))
        .map(post => ({ ...post, isConcealed: post.firstComment?.isConcealed === true })),
    [categoryPosts, blockedUserList]
  );

  // Keep just-arrived posts out of a collapsed run until their scroll flash clears.
  const forceRevealIds = useMemo(() => new Set(newPostIds), [newPostIds]);

  // there is weird behavior going on where sometimes the first page of posts returns an empty array
  // this frontend check patches that issue for now, but we should find root cause and remove this
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !categoryPosts.length) {
      // eslint-disable-next-line no-void
      void fetchNextPostPage();
    }
  }, [hasNextPage, isFetchingNextPage, categoryPosts.length, fetchNextPostPage]);

  const updatePost = useCallback(
    (post: ForumPost) => {
      // first check pinned posts
      const updatedPinnedItemIndex = pinnedCategoryResponse?.data.findIndex(item =>
        ComparePost(item, post)
      );

      if (updatedPinnedItemIndex) {
        // update pinned posts
        const updatedList =
          pinnedCategoryResponse?.data.map(item => (ComparePost(item, post) ? post : item)) ?? [];
        queryClient.setQueryData(getCategoryPinnedPostsKey(groupId, categoryId), () => updatedList);
      } else {
        // update category lists
        const updatedList: ForumPostsResponse[] =
          categoryPostResponse?.pages.map(page => ({
            ...page,
            data: page.data.map(item => (ComparePost(item, post) ? post : item))
          })) || [];

        queryClient.setQueryData(
          getCategoryPostsKey(groupId, categoryId),
          (data: InfiniteData<ForumPostsResponse> | undefined) =>
            ({
              pages: updatedList,
              pageParams: data?.pageParams
            } as InfiniteData<ForumPostsResponse>)
        );
      }
    },
    [pinnedCategoryResponse, categoryPostResponse, groupId, categoryId, queryClient]
  );

  const refetchAllPosts = useCallback(() => {
    // eslint-disable-next-line no-void
    void refetchCategoryPosts();
    // eslint-disable-next-line no-void
    void refetchPinnedCategoryPosts();
  }, [refetchPinnedCategoryPosts, refetchCategoryPosts]);

  const togglePostNotifications = useCallback(
    async (post: ForumPost) => {
      try {
        const newIsSubscribed =
          !post.notificationPreference ||
          post.notificationPreference === NotificationPreferenceType.None;
        await forumsService.togglePostNotificationSubscription(
          groupId,
          categoryId,
          post.id,
          newIsSubscribed
        );

        const updatedPost = {
          ...post,
          notificationPreference: newIsSubscribed
            ? NotificationPreferenceType.All
            : NotificationPreferenceType.None
        };
        updatePost(updatedPost);

        systemFeedbackService.success(translate('Message.NotificationPreferenceUpdated'));
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
      }
    },
    [groupId, categoryId, systemFeedbackService, updatePost, translate]
  );

  useEffect(() => {
    if (!errorLoadingPosts) return;
    systemFeedbackService.warning(translate('NetworkError'));
  }, [errorLoadingPosts, systemFeedbackService, translate]);

  useEffect(() => {
    if (!isReady || !returnToCategoryScrollTop) return;
    const root = document.documentElement;
    root.scrollTop = returnToCategoryScrollTop;
    setReturnToCategoryScrollTop(undefined);
    setHasScrolledPastFirstViewport(root.scrollTop > root.clientHeight);
  }, [isReady, returnToCategoryScrollTop, setReturnToCategoryScrollTop]);

  useEffect(() => {
    const root = document.documentElement;
    const onScroll = (): void => {
      const pastFirstViewport = root.scrollTop > root.clientHeight / 2;
      setHasScrolledPastFirstViewport(prev => {
        if (prev === pastFirstViewport) {
          return prev;
        }

        return pastFirstViewport;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollDocumentToTop = useCallback((): void => {
    const forumsSection = document.querySelector<HTMLElement>('#forums');
    if (forumsSection) {
      forumsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  if (errorLoadingPosts) {
    return (
      <SectionDisclaimer
        className='group-forums-posts-list-no-post'
        iconClassName='icon-status-alert'
        heading={translate('Error.LoadCategoryTitle')}
        message={translate('Error.ReloadingSubtitle')}
        buttonText={translate('Action.RetryLoadingPosts')}
        onClick={refetchAllPosts}
      />
    );
  }

  if (isLoading || isLoadingPinnedPosts) {
    return (
      <div className='group-forums-posts-list group-forums-posts-list-skeleton'>
        <PostPreviewSkeleton />
        <PostPreviewSkeleton />
        <PostPreviewSkeleton />
      </div>
    );
  }

  if (!categoryPosts.length && !pinnedCategoryPosts.length) {
    return (
      <SectionDisclaimer
        className='group-forums-posts-list-no-post'
        iconClassName='chat-side-icon'
        heading={translate('Label.NoPostsFoundHeader')}
        message={translate('Label.NoPostsFoundText')}
      />
    );
  }

  const renderPost = (post: ForumPost, isConcealedAndShown: boolean): JSX.Element => (
    <PostPreview
      key={post.id}
      onHighlightComplete={
        newPostIds.has(post.id) ? () => onScrollAnimationComplete(post.id) : undefined
      }
      showPinned={false}
      post={post}
      categoryName={categoryName}
      categoryShortId={categoryShortId}
      refetchPosts={refetchAllPosts}
      togglePostNotifications={() => togglePostNotifications(post)}
      isConcealedAndShown={isConcealedAndShown}
    />
  );

  return (
    <div
      className={classNames('group-forums-posts-list', {
        'group-forums-posts-list-with-footer': canCreatePost
      })}>
      {newPostIds.size > 0 && hasScrolledPastFirstViewport && (
        <button
          type='button'
          className='group-forums-new-posts-notice'
          onClick={scrollDocumentToTop}>
          <Chip
            isChecked
            text={translate('Action.NewPosts')}
            trailing='icon-filled-chevron-large-up'
            size='Small'
            variant='Utility'
          />
        </button>
      )}
      <div className='group-forums-post-list-content'>
        {pinnedCategoryPosts.map(post => (
          <PostPreview
            showPinned
            key={`${post.id}_pinned`}
            post={post}
            categoryName={categoryName}
            categoryShortId={categoryShortId}
            refetchPosts={refetchAllPosts}
            togglePostNotifications={() => togglePostNotifications(post)}
          />
        ))}
        <Messages
          items={visiblePosts}
          isConcealmentEnabled={isConcealmentEnabled}
          forceRevealIds={forceRevealIds}
          entity='post'
          renderItem={renderPost}
        />
        <InfiniteLoader onLoadMore={fetchNextPostPage} viewingThreshold={1} />
        {isFetchingNextPage && <div className='spinner spinner-default spinner-infinite-scroll' />}
      </div>
    </div>
  );
};

export default withTranslations(PostPreviewList, groupsConfig);
