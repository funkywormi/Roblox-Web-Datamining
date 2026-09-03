import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Chip } from '@rbx/foundation-ui';
import usePostCommentsRealtime from '../hooks/usePostCommentsRealtime';
import { groupsConfig } from '../translation.config';
import { CommentVariants } from '../constants/groupForumsConstants';
import CommentSkeleton from '../components/skeletons/CommentSkeleton';
import InfiniteLoader from '../../shared/components/InfiniteLoader';
import Comment from '../components/Comment';
import { usePost } from '../contexts/PostContext';
import { useComposer } from '../contexts/ComposerContext';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import useForumStore from '../hooks/useForumStore';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import Messages from '../components/Messages';
import { ForumComment } from '../types';

const CommentsSection = ({ translate }: WithTranslationsProps): JSX.Element => {
  const groupId = useForumStore.use.groupId();
  const postId = useForumStore.use.postId();
  const categoryId = useForumStore.use.categoryId();
  const newCommentIds = useForumStore.use.newCommentIds();
  const setNewCommentIds = useForumStore.use.setNewCommentIds();
  const commentsSectionRef = useRef<HTMLDivElement>(null);

  const [isScrolledAboveContent, setIsScrolledAboveContent] = useState(false);
  const {
    refetchComments,
    fetchPost,
    commentsInfiniteData,
    comments,
    fetchNextCommentsPage,
    fetchPreviousCommentsPage,
    isFetchingNextCommentsPage,
    isFetchingPreviousCommentsPage,
    isLoadingComments,
    post,
    errorLoadingComments,
    hasNextComments,
    hasPreviousComments
  } = usePost();
  const { highlightedCommentId } = useComposer();
  const blockedUserList = useForumStore.use.blockedUserList();
  const activeCommentId = useForumStore.use.activeCommentId();
  const commentId = useForumStore.use.commentId();

  const { features } = useCommunityProductFeatures();

  usePostCommentsRealtime({
    groupId,
    categoryId,
    postId,
    realtimeMessagingEnabled: !!features.RealtimeMessaging,
    data: commentsInfiniteData,
    refetchComments,
    refetchPost: fetchPost,
    setNewCommentIds
  });

  const scrollToBottomOfCommentsSection = useCallback((): void => {
    const section = commentsSectionRef.current;
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  const updateIsScrolledAboveContent = useCallback((): void => {
    const section = commentsSectionRef.current;
    if (!section) {
      setIsScrolledAboveContent(false);
      return;
    }
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const slackPx = 8;
    const intersectsViewport = rect.bottom > 0 && rect.top < viewportHeight;
    const bottomExtendsBelowViewport = rect.bottom > viewportHeight + slackPx;
    const next = intersectsViewport && bottomExtendsBelowViewport;
    setIsScrolledAboveContent(prev => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    if (errorLoadingComments || isLoadingComments || !post || comments.length <= 1) {
      return undefined;
    }

    const section = commentsSectionRef.current;
    if (!section) {
      return undefined;
    }

    updateIsScrolledAboveContent();
    window.addEventListener('scroll', updateIsScrolledAboveContent, { passive: true });
    const resizeObserver = new ResizeObserver(() => {
      updateIsScrolledAboveContent();
    });
    resizeObserver.observe(section);

    return (): void => {
      window.removeEventListener('scroll', updateIsScrolledAboveContent);
      resizeObserver.disconnect();
    };
  }, [
    errorLoadingComments,
    isLoadingComments,
    post,
    comments.length,
    updateIsScrolledAboveContent
  ]);

  const isConcealmentEnabled = features.ForumConcealment;

  const visibleComments = useMemo(
    () =>
      comments.filter(
        comment =>
          comment.id !== post?.firstComment.id &&
          !(blockedUserList.length > 0 && blockedUserList.includes(comment.createdBy))
      ),
    [comments, post?.firstComment.id, blockedUserList]
  );

  // Keep just-arrived comments and the deep-link target out of a collapsed chunk. A reply deep-link
  // targets the reply (activeCommentId); also pin its parent (commentId), which hosts the replies
  // section, or the concealed parent never mounts to render the reply.
  const forceRevealIds = useMemo(() => {
    const ids = new Set(newCommentIds);
    if (activeCommentId) {
      ids.add(activeCommentId);
    }
    if (commentId) {
      ids.add(commentId);
    }
    return ids;
  }, [newCommentIds, activeCommentId, commentId]);

  if (errorLoadingComments) {
    return (
      <SectionDisclaimer
        iconClassName='icon-status-alert'
        heading={translate('Error.LoadCommentsTitle')}
        message={translate('Error.ReloadingSubtitle')}
        buttonText={translate('Action.RetryLoadingComments')}
        onClick={refetchComments}
      />
    );
  }

  if (isLoadingComments || !post) {
    return (
      <div className='group-forums-comments-section group-forums-comments-section-loading'>
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  if (comments.length <= 1) {
    const iconClassName = post?.isLocked ? 'locked-status-icon' : 'chat-side-icon';
    const heading = post?.isLocked
      ? translate('Label.LockedForumPost')
      : translate('Label.NoCommentsFoundHeader');
    const message = post?.isLocked
      ? translate('Message.LockedForumPostComment')
      : translate('Label.NoCommentsFoundText');
    return <SectionDisclaimer iconClassName={iconClassName} heading={heading} message={message} />;
  }

  const canLoadTop = hasPreviousComments && !isFetchingPreviousCommentsPage;
  const canLoadBottom = hasNextComments && !isFetchingNextCommentsPage;

  const renderComment = (comment: ForumComment, isConcealedAndShown: boolean): JSX.Element => (
    <Comment
      key={comment.id}
      id={comment.id}
      createdBy={comment.createdBy}
      creatorInfo={comment.creatorInfo}
      createdAt={comment.createdAt}
      updatedAt={comment.updatedAt}
      content={comment.content}
      threadId={comment.threadId}
      channelId={comment.parentId}
      variant={CommentVariants.Comment}
      isActive={highlightedCommentId === comment.id}
      reactions={comment.reactions}
      initialThreadComments={comment.threadComments}
      isConcealedAndShown={isConcealedAndShown}
    />
  );

  return (
    <div ref={commentsSectionRef} className='group-forums-comments-section'>
      {newCommentIds.size > 0 && isScrolledAboveContent && (
        <button
          type='button'
          className='group-forums-new-comments-notice'
          onClick={scrollToBottomOfCommentsSection}>
          <Chip
            isChecked
            text={translate('Action.NewComments')}
            trailing='icon-filled-chevron-large-down'
            size='Small'
            variant='Utility'
          />
        </button>
      )}
      {canLoadTop && (
        <div className='group-forums-comments-section-loader-top'>
          {!activeCommentId && ( // don't interrupt deep-link scrolling position by loading more comments
            <InfiniteLoader onLoadMore={fetchPreviousCommentsPage} viewingThreshold={1} />
          )}
        </div>
      )}
      {isFetchingPreviousCommentsPage && (
        <div className='group-forums-comments-section-spinner spinner spinner-default spinner-infinite-scroll' />
      )}
      <Messages
        items={visibleComments}
        isConcealmentEnabled={isConcealmentEnabled}
        forceRevealIds={forceRevealIds}
        renderItem={renderComment}
      />
      {canLoadBottom && (
        <div className='group-forums-comments-section-loader-bottom'>
          <InfiniteLoader onLoadMore={fetchNextCommentsPage} viewingThreshold={1} />
        </div>
      )}
      {isFetchingNextCommentsPage && (
        <div className='group-forums-comments-section-spinner spinner spinner-default spinner-infinite-scroll' />
      )}
    </div>
  );
};
export default withTranslations(CommentsSection, groupsConfig);
