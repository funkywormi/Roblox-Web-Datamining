/* eslint-disable user-communities/no-large-components */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { IconButton } from '@rbx/foundation-ui';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import {
  Reaction,
  CommentCreatorInfo,
  ForumCommentsResponse,
  ForumThreadCommentsResponse,
  ForumComment
} from '../types';
import { groupsConfig } from '../translation.config';
import UserDisplay from '../../shared/components/UserDisplay';
import { renderPostAuthorTicketStatus } from './supportTicket/SupportTicketStatusPill';
import CommentReactions from './CommentReactions';
import groupForumsConstants, { CommentVariants } from '../constants/groupForumsConstants';
import forumsService from '../services/forumsService';
import { usePost } from '../contexts/PostContext';
import { useComposer } from '../contexts/ComposerContext';
import CommentReplies from '../containers/CommentReplies';
import CommentComposer from './CommentComposer';
import AccessibleDivButton from '../../shared/components/AccessibleDivButton';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import PostMenu from './PostMenu';
import CommentMenu from './CommentMenu';
import useReplyDisabledState from '../hooks/useReplyDisabledState';
import ConditionalTooltip from '../../shared/components/ConditionalTooltip';
import ScrollFlashOverlay from './ScrollFlashOverlay';
import useForumStore from '../hooks/useForumStore';
import { getCommentRepliesKey } from '../services/queryKeys';
import { useForumExperiments } from '../contexts/ForumExperimentsContext';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import '../../../../css/tailwind.css';
import { MessageContent } from '../../shared/types';
import Message from '../../shared/components/content/MessageContent';
import { logGroupForumsClickEvent } from '../../shared/utils/logging';
import AgeCheckWrapper from './AgeCheckWrapper';
import { EventTriggerReason } from '../../shared/constants/eventConstants';
import { hasRichTextContent } from '../../shared/utils/messageContentUtils';

const RailWrapper: FC<{ hasRail: boolean; children: React.ReactNode }> = ({ children, hasRail }) =>
  hasRail ? (
    <div className='group-forums-comment-rail'>{children}</div>
  ) : (
    <React.Fragment>{children}</React.Fragment>
  );

export type CommentProps = {
  id: string;
  createdBy: number;
  creatorInfo: CommentCreatorInfo;
  createdAt: string;
  updatedAt: string;
  content: MessageContent;
  title?: string;
  threadId: string | null; // The id of the channel with the thread of comments replying to this comment (if there is one)
  channelId: string; // The id of the channel this comment is in
  variant: CommentVariants;
  isActive: boolean;
  reactions: Reaction[];
  parentCommentId?: string;
  initialThreadComments?: ForumThreadCommentsResponse | null;
  onHidePost?: () => void;
  isConcealedAndShown?: boolean;
} & WithTranslationsProps;

const Comment = ({
  id,
  threadId,
  channelId,
  title,
  variant,
  isActive,
  createdBy,
  createdAt,
  updatedAt,
  content,
  parentCommentId,
  reactions,
  creatorInfo,
  initialThreadComments,
  translate,
  onHidePost,
  isConcealedAndShown
}: CommentProps): JSX.Element => {
  const history = useHistory();
  const { systemFeedbackService } = useSystemFeedback();
  const { post, togglePostNotifications, toggleCommentNotifications } = usePost();
  const { setReplyToCommentOrPost, setReplyToCommentReply } = useComposer();
  const { canReact } = useForumPermissions();
  const threadCommentId = useForumStore.use.threadCommentId();
  const [isQueryEnabled, setEnableQuery] = useState<boolean>(!!threadCommentId);
  const groupId = useForumStore.use.groupId();
  const categoryId = useForumStore.use.categoryId()!;
  const categoryShortId = useForumStore.use.categoryShortId()!;
  const categoryName = useForumStore.use.categoryName()!;
  const postId = useForumStore.use.postId()!;
  const activeCommentId = useForumStore.use.activeCommentId();
  const newCommentIds = useForumStore.use.newCommentIds();
  const setNewCommentIds = useForumStore.use.setNewCommentIds();
  const useInlineReply = useForumStore.use.useInlineReply();
  const setActiveCommentId = useForumStore.use.setActiveCommentId();
  const isCategoryArchived = useForumStore.use.isCategoryArchived();
  const { fetchSubscriberExperimentValues } = useForumExperiments();
  const { forumsWrite } = useCommunityFeatureFreezes();

  const onDeletePost = () => {
    history.push(groupForumsConstants.router.getCategoryRoute(categoryId, categoryName));
  };

  // infinite load category posts
  const {
    isLoading: isLoadingReplies,
    isFetchingPreviousPage: isFetchingPreviousRepliesPage,
    isFetchingNextPage: isFetchingNextRepliesPage,
    data: repliesResponse,
    fetchPreviousPage: fetchPreviousRepliesPage,
    fetchNextPage: fetchNextRepliesPage,
    isError,
    hasPreviousPage,
    hasNextPage
  } = useInfiniteQuery({
    retry: 1,
    queryKey: getCommentRepliesKey(groupId, categoryId, threadId || ''),
    queryFn: async ({ queryKey, pageParam: cursor }) => {
      const [, queryGroupId, queryCategoryId, queryThreadId] = queryKey;
      const response = await forumsService.getGroupForumComments(
        queryGroupId,
        queryCategoryId,
        queryThreadId,
        groupForumsConstants.pageCounts.commentsPerPage,
        cursor,
        threadCommentId
      );

      return response;
    },
    initialData: initialThreadComments
      ? ({
          pages: [
            {
              data: initialThreadComments.comments,
              nextPageCursor: initialThreadComments.nextPageCursor,
              previousPageCursor: initialThreadComments.previousPageCursor
            }
          ],
          pageParams: [initialThreadComments.nextPageCursor]
        } as InfiniteData<ForumCommentsResponse>)
      : undefined,
    getPreviousPageParam: (lastPage: ForumCommentsResponse) =>
      lastPage.previousPageCursor || undefined,
    getNextPageParam: (lastPage: ForumCommentsResponse) => lastPage.nextPageCursor || undefined,
    enabled: !!(groupId && categoryId && threadId) && isQueryEnabled
  });

  const replies = useMemo(() => {
    const pages = repliesResponse ? repliesResponse.pages : [];
    return pages.reduce((acc, response) => acc.concat(response.data), [] as ForumComment[]);
  }, [repliesResponse]);

  const hasPreviousReplies = useMemo(() => {
    const isFirstReplyVisible = !initialThreadComments
      ? false
      : !!initialThreadComments.comments.length &&
        !!replies.length &&
        initialThreadComments.comments[0].id !== replies[0].id;

    // if user has interacted with showing more, use server's opinion if its set
    if (isQueryEnabled && hasPreviousPage !== undefined) {
      return hasPreviousPage && isFirstReplyVisible;
    }

    // on initial load, if replies dont match initial comments, we have loaded into a threadCommentId deep link
    return isFirstReplyVisible;
  }, [hasPreviousPage, initialThreadComments, replies, isQueryEnabled]);

  const hasMoreReplies = useMemo(() => {
    // if user has interacted with showing more, use server's opinion if its set
    if (isQueryEnabled && hasNextPage !== undefined) {
      return hasNextPage;
    }

    // on initial load, we might have some preloaded comments
    return !!initialThreadComments?.hasMore;
  }, [hasNextPage, initialThreadComments, isQueryEnabled]);

  const showRepliesSection = useMemo(() => {
    return variant === CommentVariants.Comment && threadId !== null && replies.length > 0;
  }, [threadId, variant, replies]);

  const readOnlyReactions = useMemo(
    () => !canReact || isCategoryArchived || forumsWrite.isDisabled,
    [canReact, isCategoryArchived, forumsWrite.isDisabled]
  );

  const onToggleCommentReaction = async (emoteId: string, togglingOn: boolean) => {
    try {
      const metadata = {
        categoryId,
        postId,
        isPostComment: variant === CommentVariants.Post
      };
      await forumsService.toggleGroupForumReaction(
        groupId,
        variant === CommentVariants.Reply ? channelId : postId,
        id,
        emoteId,
        togglingOn,
        metadata
      );
      logGroupForumsClickEvent({
        groupId,
        clickTargetType: `toggleCommentReaction${togglingOn ? 'On' : 'Off'}`,
        clickTargetId: emoteId,
        hasRichText: hasRichTextContent(content)
      });
      return true;
    } catch {
      systemFeedbackService.warning(translate('NetworkError'));
    }
    return false;
  };

  const handleShowRepliesClicked = useCallback(() => {
    setEnableQuery(true);

    logGroupForumsClickEvent({
      groupId,
      clickTargetType: 'showCommentReplies',
      clickTargetId: id
    });
  }, [groupId, id]);

  const handleGetNextRepliesClicked = useCallback(() => {
    if (!isQueryEnabled) {
      setEnableQuery(true);
    } else {
      // eslint-disable-next-line no-void
      void fetchNextRepliesPage();
    }
  }, [fetchNextRepliesPage, isQueryEnabled, setEnableQuery]);

  const handleGetPreviousRepliesClicked = useCallback(() => {
    // eslint-disable-next-line no-void
    void fetchPreviousRepliesPage();
  }, [fetchPreviousRepliesPage]);

  const handleReply = useCallback(() => {
    if (variant === CommentVariants.Reply && parentCommentId) {
      setReplyToCommentReply(parentCommentId, id);
    } else if (variant !== CommentVariants.Reply) {
      setReplyToCommentOrPost(id);
    }
    logGroupForumsClickEvent({
      groupId,
      clickTargetType: variant === CommentVariants.Reply ? 'replyToReply' : 'replyToComment',
      clickTargetId: id,
      hasRichText: hasRichTextContent(content)
    });
  }, [
    groupId,
    id,
    parentCommentId,
    content,
    setReplyToCommentOrPost,
    setReplyToCommentReply,
    variant
  ]);

  const handleMenuOpened = useCallback(() => {
    const isPost = variant === CommentVariants.Post;

    logGroupForumsClickEvent({
      groupId,
      clickTargetType: isPost ? 'openPostMenuFromComment' : 'openCommentMenu',
      clickTargetId: id
    });

    if (isPost) {
      // delay fetching experiment values until the user opens the menu to only access enroll users
      // into the experiment who have opened the post menu
      fetchSubscriberExperimentValues();
    }
  }, [id, variant, groupId]);

  useEffect(() => {
    if (isError) {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  }, [systemFeedbackService, translate, isError]);

  const overflowButton = () => {
    return (
      <IconButton
        as='button'
        icon='icon-filled-three-dots-horizontal'
        variant='Utility'
        size='Medium'
        ariaLabel={translate('Action.More')}
        onClick={handleMenuOpened}
      />
    );
  };

  const toggleNotificationsCallback = useCallback(() => {
    try {
      if (variant === CommentVariants.Post) {
        togglePostNotifications();
      } else {
        toggleCommentNotifications(id);
      }
      systemFeedbackService.success(translate('Message.NotificationPreferenceUpdated'));
    } catch {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  }, [
    id,
    variant,
    systemFeedbackService,
    togglePostNotifications,
    toggleCommentNotifications,
    translate
  ]);

  const renderMenu = () => {
    if (variant === CommentVariants.Post) {
      if (!post) return null;
      return (
        <PostMenu
          post={post}
          button={overflowButton()}
          onDelete={onDeletePost}
          onSubscribe={toggleNotificationsCallback}
          onHidePost={onHidePost}
        />
      );
    }

    return (
      <CommentMenu
        button={overflowButton()}
        isReply={variant === CommentVariants.Reply}
        createdBy={createdBy}
        commentId={id}
        parentCommentId={parentCommentId}
        threadId={threadId}
        channelId={channelId}
        isPostLocked={post?.isLocked ?? false}
        onSubscribe={toggleNotificationsCallback}
      />
    );
  };

  const onScrollAnimationComplete = useCallback(() => {
    setActiveCommentId();
    setNewCommentIds(new Set(Array.from(newCommentIds).filter(commentId => commentId !== id)));
  }, [setActiveCommentId, setNewCommentIds, newCommentIds, id]);

  const { disabled: replyDisabled, disabledTooltip: replyDisabledTooltip } = useReplyDisabledState({
    translate
  });

  const showInlineCommentComposer = useInlineReply && isActive;

  const { displayName, hasVerifiedBadge, groupRoleName } = creatorInfo;

  const editedDate = createdAt !== updatedAt ? new Date(updatedAt) : undefined;

  return (
    <div
      className={classNames(
        'group-forums-comment',
        variant && `group-forums-comment-variant-${variant}`,
        isActive && 'group-forums-comment-active',
        isConcealedAndShown && 'group-forums-comment-concealed-shown'
      )}
      data-id={id}>
      <div className='group-forums-comment-header'>
        <UserDisplay
          userId={createdBy}
          groupId={groupId}
          createdTime={createdAt}
          userDisplayName={displayName}
          hasVerifiedBadge={hasVerifiedBadge}
          groupRoleName={groupRoleName ?? translate('Label.FormerMember')}
          metaTrailing={
            variant === CommentVariants.Post && post
              ? renderPostAuthorTicketStatus(
                  post.supportTicket,
                  post.groupId,
                  categoryShortId,
                  post.shortId,
                  post.createdBy
                )
              : undefined
          }
        />
        <div className='group-forums-comment-menu'>{renderMenu()}</div>
      </div>
      {title && <h2 className='group-forums-comment-title'>{title.trim()}</h2>}
      <RailWrapper hasRail={showRepliesSection}>
        <div className='group-forums-comment-content richtext-base'>
          <Message content={content} />
          {editedDate && (
            <span
              className='group-forums-comment-content-edited-marker'
              title={editedDate.toLocaleString()}>
              &ensp;{translate('Label.EditedMarker')}
            </span>
          )}
        </div>
        <div className='groups-forums-comment-metadata-section'>
          <div className='groups-forums-comment-metadata-reaction-section'>
            <CommentReactions
              initialReactions={reactions}
              onToggleReaction={onToggleCommentReaction}
              viewOnly={readOnlyReactions}
            />
          </div>
          {variant !== CommentVariants.Post && (
            <ConditionalTooltip
              id={`reply-tooltip-${id}`}
              position='left-center'
              content={replyDisabledTooltip}
              enabled={replyDisabled}>
              <AgeCheckWrapper messageId={id} trigger={EventTriggerReason.InteractComment}>
                <AccessibleDivButton
                  onClick={!replyDisabled ? handleReply : undefined}
                  className={classNames({
                    'groups-forums-comment-metadata-reply-section': true,
                    disabled: replyDisabled
                  })}>
                  <span className='group-forums-comment-reply-icon' />
                  {translate('Action.Reply')}
                </AccessibleDivButton>
              </AgeCheckWrapper>
            </ConditionalTooltip>
          )}
        </div>
        {showInlineCommentComposer && (
          <div
            className={classNames(
              'group-forums-inline-comment-composer-container',
              variant === CommentVariants.Reply &&
                'group-forums-inline-comment-composer-reply-container',
              variant === CommentVariants.Comment &&
                'group-forums-inline-comment-composer-comment-container'
            )}>
            <div className='group-forums-inline-comment-composer'>
              <CommentComposer autoFocus showCancelButton />
            </div>
          </div>
        )}
        {showRepliesSection && (
          <CommentReplies
            replies={replies}
            onShowReplies={handleShowRepliesClicked}
            onLoadPrevious={handleGetPreviousRepliesClicked}
            onLoadNext={handleGetNextRepliesClicked}
            isLoading={isLoadingReplies}
            isFetchingMore={isFetchingNextRepliesPage || isFetchingPreviousRepliesPage}
            hasPrevious={hasPreviousReplies}
            hasNext={hasMoreReplies}
            loadingError={isError}
            parentId={id}
            revealRepliesByDefault={isConcealedAndShown}
          />
        )}
        {activeCommentId === id && <ScrollFlashOverlay onComplete={onScrollAnimationComplete} />}
        {newCommentIds.has(id) && (
          <ScrollFlashOverlay onComplete={onScrollAnimationComplete} enableScrollIntoView={false} />
        )}
      </RailWrapper>
    </div>
  );
};

export default withTranslations(Comment, groupsConfig);
