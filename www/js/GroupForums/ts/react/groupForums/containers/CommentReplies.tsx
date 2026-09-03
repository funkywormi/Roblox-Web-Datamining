import React, { useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';
import { CommentVariants } from '../constants/groupForumsConstants';
import CommentSkeleton from '../components/skeletons/CommentSkeleton';
import Comment from '../components/Comment';
import { useComposer } from '../contexts/ComposerContext';
import { ForumComment } from '../types';
import useForumStore from '../hooks/useForumStore';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import Messages from '../components/Messages';

export type CommentRepliesProps = {
  replies: ForumComment[];
  onShowReplies: () => void;
  onLoadPrevious: () => void;
  onLoadNext: () => void;
  isLoading: boolean;
  isFetchingMore: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  loadingError: boolean;
  parentId: string;
  // The parent comment is itself concealed and currently revealed; cascade that reveal onto its
  // concealed replies so opening the parent shows the thread, with each reply still collapsible.
  revealRepliesByDefault?: boolean;
} & WithTranslationsProps;

const CommentReplies = ({
  replies,
  onShowReplies,
  onLoadPrevious,
  onLoadNext,
  isLoading,
  isFetchingMore,
  parentId,
  hasPrevious,
  hasNext,
  loadingError,
  revealRepliesByDefault = false,
  translate
}: CommentRepliesProps): JSX.Element => {
  const { highlightedCommentId } = useComposer();
  const blockedUserList = useForumStore.use.blockedUserList();
  const { features } = useCommunityProductFeatures();
  const activeCommentId = useForumStore.use.activeCommentId();
  const threadCommentId = useForumStore.use.threadCommentId();
  const newCommentIds = useForumStore.use.newCommentIds();
  const isConcealmentEnabled = features.ForumConcealment;

  const visibleReplies = useMemo(
    () =>
      (replies ?? []).filter(
        reply => !(blockedUserList.length > 0 && blockedUserList.includes(reply.createdBy))
      ),
    [replies, blockedUserList]
  );

  // Keep just-arrived replies and the deep-link target out of a collapsed chunk. threadCommentId
  // persists past the scroll flash (unlike activeCommentId), so its chunk stays revealed.
  const forceRevealIds = useMemo(() => {
    const ids = new Set(newCommentIds);
    if (activeCommentId) {
      ids.add(activeCommentId);
    }
    if (threadCommentId) {
      ids.add(threadCommentId);
    }
    return ids;
  }, [newCommentIds, activeCommentId, threadCommentId]);

  const handleShowRepliesKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onShowReplies();
    }
  };

  const handleLoadMoreKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onLoadNext();
    }
  };

  if (loadingError && (!replies || replies.length === 0)) {
    return (
      <div className='groups-forums-comment-replies-show-more'>
        <div
          role='button'
          tabIndex={0}
          onClick={onShowReplies}
          onKeyDown={handleShowRepliesKeyDown}
          className='groups-forums-comment-replies-show-more-btn'>
          <div className='groups-forums-comment-replies-show-more-dash' />
          {translate('Action.ShowReplies')}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='group-forums-comment-replies group-forums-comment-replies-loading'>
        <CommentSkeleton />
      </div>
    );
  }

  const renderReply = (reply: ForumComment, isConcealedAndShown: boolean): JSX.Element => (
    <div key={reply.id} className='groups-forums-comment-reply'>
      <Comment
        key={reply.id}
        variant={CommentVariants.Reply}
        isActive={highlightedCommentId === reply.id}
        id={reply.id}
        createdBy={reply.createdBy}
        creatorInfo={reply.creatorInfo}
        createdAt={reply.createdAt}
        updatedAt={reply.updatedAt}
        content={reply.content}
        threadId={null}
        channelId={reply.parentId}
        parentCommentId={parentId}
        reactions={reply.reactions}
        isConcealedAndShown={isConcealedAndShown}
      />
    </div>
  );

  return (
    <div className='groups-forums-comment-replies group-forums-comment-replies-loaded'>
      {hasPrevious && !isFetchingMore && (
        <div className='groups-forums-comment-replies-show-more'>
          <div
            role='button'
            tabIndex={0}
            onClick={onLoadPrevious}
            className='groups-forums-comment-replies-show-more-btn'>
            <div className='groups-forums-comment-replies-show-more-dash' />
            {translate('Action.ShowMoreReplies')}
          </div>
        </div>
      )}
      <Messages
        items={visibleReplies}
        isConcealmentEnabled={isConcealmentEnabled}
        forceRevealIds={forceRevealIds}
        revealConcealedByDefault={revealRepliesByDefault}
        entity='reply'
        renderItem={renderReply}
      />
      {hasNext && !isFetchingMore && (
        <div className='groups-forums-comment-replies-show-more'>
          <div
            role='button'
            tabIndex={0}
            onClick={onLoadNext}
            onKeyDown={handleLoadMoreKeyDown}
            className='groups-forums-comment-replies-show-more-btn'>
            <div className='groups-forums-comment-replies-show-more-dash' />
            {translate('Action.ShowMoreReplies')}
          </div>
        </div>
      )}
      {isFetchingMore && <div className='spinner spinner-default spinner-infinite-scroll' />}
    </div>
  );
};
export default withTranslations(CommentReplies, groupsConfig);
