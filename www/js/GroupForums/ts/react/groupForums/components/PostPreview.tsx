import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useHistory } from 'react-router-dom';
import { IconButton } from '@rbx/foundation-ui';
import { ForumPost } from '../types';
import { groupsConfig } from '../translation.config';
import UserDisplay, {
  USER_DISPLAY_AVATAR_USERNAME_LINK_CLASS
} from '../../shared/components/UserDisplay';
import PostPreviewReactions from './PostPreviewReactions';
import AnimatedAbbreviatedCount from '../../shared/components/AnimatedAbbreviatedCount';
import groupForumsConstants from '../constants/groupForumsConstants';
import PostMenu, { POST_MENU_CLASS } from './PostMenu';
import {
  POST_PREVIEW_TICKET_STATUS_CLASS,
  renderPostAuthorTicketStatus
} from './supportTicket/SupportTicketStatusPill';
import useForumStore from '../hooks/useForumStore';
import { useForumExperiments } from '../contexts/ForumExperimentsContext';
import '../../../../css/tailwind.css';
import Message from '../../shared/components/content/MessageContent';
import { logGroupForumsClickEvent, logGroupPageExposureEvent } from '../../shared/utils/logging';
import { EventContext, EventType } from '../../shared/constants/eventConstants';
import { hasRichTextContent } from '../../shared/utils/messageContentUtils';
import ScrollFlashOverlay from './ScrollFlashOverlay';
import renderHighlightedText from '../utils/renderHighlightedText';

const META_DATA_SEPARATOR = ' • ';
const POST_PREVIEW_MENU_CLASS = 'group-forums-post-preview-menu';

// Module-scope so the optional callbacks' defaults keep a stable identity across renders.
const NOOP = (): void => undefined;

// Descendants that own their own click behavior, so post navigation bails when the target sits
// inside one. The portaled menu panel needs an entry too: its clicks bubble via React, not the DOM.
const POST_NAV_BLOCK_SELECTOR = [
  `.${POST_PREVIEW_MENU_CLASS}`,
  `.${POST_MENU_CLASS}`,
  `.${USER_DISPLAY_AVATAR_USERNAME_LINK_CLASS}`,
  `.${POST_PREVIEW_TICKET_STATUS_CLASS}`
].join(', ');

export type PostPreviewProps = {
  showPinned: boolean;
  hasMenu?: boolean;
  hasRouter?: boolean;
  onHighlightComplete?: () => void;
  categoryName: string;
  categoryShortId: string;
  showCategoryName?: boolean;
  post: ForumPost;
  // Only reached through the overflow menu, so `hasMenu={false}` callers can leave these out.
  refetchPosts?: () => void;
  onMenuOpened?: () => void;
  togglePostNotifications?: (postId: string) => void;
  onOpened?: () => void;
  highlightedTitle?: string;
  highlightedBody?: string;
  isConcealedAndShown?: boolean;
} & WithTranslationsProps;

const PostPreview = ({
  post,
  onHighlightComplete,
  hasMenu = true,
  hasRouter = true,
  categoryName,
  categoryShortId,
  showCategoryName,
  showPinned,
  refetchPosts = NOOP,
  onMenuOpened,
  togglePostNotifications = NOOP,
  highlightedTitle,
  highlightedBody,
  isConcealedAndShown,
  onOpened,
  translate
}: PostPreviewProps): JSX.Element | null => {
  const history = useHistory();
  const blockedUserList = useForumStore.use.blockedUserList();
  const setReturnToCategoryScrollTop = useForumStore.use.setReturnToCategoryScrollTop();
  const { fetchSubscriberExperimentValues } = useForumExperiments();

  const onPressPost = (event?: React.MouseEvent) => {
    if (event && event.target instanceof Element) {
      // Clicks on these interactive descendants own their own behavior, so bail before navigating
      // (the bubbled event would otherwise open the post too).
      if (event.target.closest(POST_NAV_BLOCK_SELECTOR)) {
        return;
      }
      // We want to allow opening this link in a new tab
      // cmd or ctrl key modifiers will have different behaviors that we want to support
      if (event.metaKey || event.ctrlKey) {
        onOpened?.();
        return;
      }
    }

    // suppress href native click
    if (event) {
      event.preventDefault();
    }

    setReturnToCategoryScrollTop(document.documentElement.scrollTop);

    // Before the navigation, so nothing has to survive it.
    logGroupForumsClickEvent({
      groupId: post.groupId,
      clickTargetType: 'openPost',
      clickTargetId: post.id,
      hasRichText: hasRichTextContent(post.firstComment.content)
    });
    onOpened?.();

    history.push(
      groupForumsConstants.router.getPostRoute(
        categoryShortId,
        categoryName,
        post.shortId,
        post.name
      )
    );

    document.documentElement.scrollTop = 0;
  };

  // Handle keyboard interactions
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPressPost();
    }
  };

  const handleMenuOpened = useCallback(
    (event?: React.MouseEvent) => {
      if (event) {
        // do not navigate into post when menu opened
        event.preventDefault();
      }
      onMenuOpened?.();
      logGroupForumsClickEvent({
        groupId: post.groupId,
        clickTargetType: 'openPostMenu',
        clickTargetId: post.id
      });
      // delay fetching experiment values until the user opens the menu to only access enroll users into the experiment who have opened the post menu
      fetchSubscriberExperimentValues();
    },
    [post.groupId, post.id, onMenuOpened]
  );

  const togglePostNotificationsCallback = useCallback(() => {
    togglePostNotifications(post.id);
  }, [post.id, togglePostNotifications]);

  const replyCount = useMemo(() => {
    if (post.commentCount <= 0) return 0;
    return post.commentCount - 1; // We don't count the first comment as a reply
  }, [post.commentCount]);

  const postPreviewRef = useRef<HTMLAnchorElement>(null);
  const hasLoggedExposure = useRef(false);

  useEffect(() => {
    const element = postPreviewRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.75 && !hasLoggedExposure.current) {
          hasLoggedExposure.current = true;
          logGroupPageExposureEvent({
            groupId: post.groupId,
            context: EventContext.GroupForums,
            exposureType: EventType.GroupForumPostExposureEvent,
            exposureId: post.id
          });
        }
      },
      { threshold: 0.75 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [post.groupId, post.id]);

  if (blockedUserList.length > 0 && blockedUserList.includes(post.createdBy)) {
    return null;
  }

  const {
    name: postTitle,
    createdBy,
    createdAt,
    firstComment,
    isUnread,
    isPinned,
    isLocked,
    supportTicket
  } = post;

  const {
    creatorInfo: { displayName, hasVerifiedBadge, groupRoleName },
    content,
    reactions
  } = firstComment;

  const hasReactions = reactions.length > 0;
  const hasStatuses = isUnread || (showPinned && isPinned) || isLocked;

  const ticketStatus = renderPostAuthorTicketStatus(
    supportTicket,
    post.groupId,
    categoryShortId,
    post.shortId,
    post.createdBy
  );
  const shouldShowCategoryName = !!showCategoryName && !!categoryName;

  return (
    <a
      ref={postPreviewRef}
      className={classNames(
        'group-forums-post-preview',
        isConcealedAndShown && 'group-forums-post-preview-concealed-shown'
      )}
      data-id={post.shortId}
      data-is-unread={isUnread}
      data-is-pinned={isPinned}
      data-is-locked={isLocked}
      onClick={hasRouter ? onPressPost : undefined}
      href={groupForumsConstants.deepLinks.groupForumPostUrl(
        post.groupId,
        categoryShortId,
        categoryName,
        post.shortId,
        post.name
      )}>
      <div className='group-forums-post-preview-header'>
        <UserDisplay
          userId={createdBy}
          groupId={post.groupId}
          createdTime={createdAt}
          userDisplayName={displayName}
          hasVerifiedBadge={hasVerifiedBadge}
          groupRoleName={groupRoleName ?? translate('Label.FormerMember')}
          metaTrailing={
            ticketStatus || shouldShowCategoryName ? (
              <React.Fragment>
                {ticketStatus}
                {shouldShowCategoryName && (
                  <React.Fragment>
                    {/* UserDisplay already separates metaTrailing from the role; this only
                        divides the two pieces within it. */}
                    {ticketStatus && META_DATA_SEPARATOR}
                    <span>{categoryName}</span>
                  </React.Fragment>
                )}
              </React.Fragment>
            ) : undefined
          }
        />
        {hasMenu && (
          <div className={POST_PREVIEW_MENU_CLASS}>
            <PostMenu
              post={post}
              onRefetchPosts={refetchPosts}
              onDelete={refetchPosts}
              onSubscribe={togglePostNotificationsCallback}
              onHidePost={refetchPosts}
              button={
                <IconButton
                  as='button'
                  icon='icon-filled-three-dots-horizontal'
                  variant='Utility'
                  size='Medium'
                  ariaLabel={translate('Action.More')}
                  onClick={handleMenuOpened}
                />
              }
            />
          </div>
        )}
      </div>
      <div
        role='button'
        tabIndex={0}
        className='group-forums-post-preview-content'
        onKeyDown={hasRouter ? handleKeyDown : undefined}>
        <div className='group-forums-post-preview-title-container'>
          {hasStatuses && (
            <div className='group-forums-post-preview-statuses'>
              {isUnread && <div className='group-forums-post-preview-unread-status' />}
              {showPinned && isPinned && (
                <span className='group-forums-post-preview-pinned-status-icon' />
              )}
              {isLocked && <span className='group-forums-post-preview-locked-status-icon' />}
            </div>
          )}
          <h2 className='group-forums-post-preview-title text-emphasis text-overflow'>
            {highlightedTitle ? renderHighlightedText(highlightedTitle) : postTitle}
          </h2>
        </div>
        <div
          className={classNames(
            'group-forums-post-preview-content-comment',
            'richtext-base',
            isUnread ? 'font-bold text-emphasis' : 'text-default'
          )}>
          {highlightedBody ? renderHighlightedText(highlightedBody) : <Message content={content} />}
        </div>
        <div className='group-forums-post-preview-meta-data'>
          {hasReactions && (
            <React.Fragment>
              <div className='group-forums-post-preview-meta-data-reactions text-default'>
                <PostPreviewReactions reactions={reactions} />
              </div>
              <div className='group-forums-post-preview-meta-data-separator'>
                {META_DATA_SEPARATOR}
              </div>
            </React.Fragment>
          )}
          <div className='group-forums-post-preview-meta-data-replies text-default'>
            <span className='group-forums-post-preview-replies-icon' />
            <AnimatedAbbreviatedCount variant='reply' value={replyCount} />{' '}
            {replyCount === 1 ? translate('Label.Reply') : translate('Label.Replies')}
          </div>
        </div>
      </div>
      {onHighlightComplete && (
        <ScrollFlashOverlay onComplete={onHighlightComplete} enableScrollIntoView={false} />
      )}
    </a>
  );
};

export default withTranslations(PostPreview, groupsConfig);
