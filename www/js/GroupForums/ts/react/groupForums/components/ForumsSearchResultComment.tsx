import React, { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { ForumPost, ForumComment } from '../types';
import { SearchHighlights } from '../types/search';
import { groupsConfig } from '../translation.config';
import UserDisplay from '../../shared/components/UserDisplay';
import Message from '../../shared/components/content/MessageContent';
import groupForumsConstants from '../constants/groupForumsConstants';
import useForumStore from '../hooks/useForumStore';
import renderHighlightedText from '../utils/renderHighlightedText';

export type ForumsSearchResultCommentProps = {
  post: ForumPost;
  comment: ForumComment;
  highlights?: SearchHighlights;
  categoryName: string;
  categoryShortId: string;
  showCategoryName: boolean;
  onResultClick: () => void;
} & WithTranslationsProps;

const ForumsSearchResultComment = ({
  post,
  comment,
  highlights,
  categoryName,
  categoryShortId,
  showCategoryName,
  onResultClick,
  translate
}: ForumsSearchResultCommentProps): JSX.Element => {
  const groupId = useForumStore.use.groupId();
  const history = useHistory();

  const postAuthor = post.firstComment?.creatorInfo?.displayName ?? '';
  // No post timestamp here: the only time shown is the comment's, on its UserDisplay below.
  const contextMeta = useMemo(
    () => [postAuthor, showCategoryName ? categoryName : undefined].filter(Boolean).join(' • '),
    [postAuthor, showCategoryName, categoryName]
  );

  const commentRoute = useMemo(
    () =>
      groupForumsConstants.router.getPostCommentRoute(
        categoryShortId,
        categoryName,
        post.shortId,
        post.name,
        comment.id
      ),
    [categoryShortId, categoryName, post.shortId, post.name, comment.id]
  );

  const commentHref = useMemo(
    () =>
      groupForumsConstants.deepLinks.groupForumCommentUrl(
        groupId,
        categoryShortId,
        categoryName,
        post.shortId,
        post.name,
        comment.id
      ),
    [groupId, categoryShortId, categoryName, post.shortId, post.name, comment.id]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.metaKey || event.ctrlKey) {
        onResultClick();
        return;
      }
      event.preventDefault();
      history.push(commentRoute);
      onResultClick();
    },
    [history, commentRoute, onResultClick]
  );

  return (
    <a className='group-forums-search-result-comment' href={commentHref} onClick={handleClick}>
      <div className='group-forums-search-result-comment-context text-body-small content-muted'>
        <span className='content-emphasis'>{post.name}</span>
        {contextMeta && ` • ${contextMeta}`}
      </div>
      <div className='group-forums-search-result-comment-body'>
        <UserDisplay
          userId={comment.createdBy}
          groupId={groupId}
          userDisplayName={comment.creatorInfo.displayName}
          hasVerifiedBadge={comment.creatorInfo.hasVerifiedBadge}
          groupRoleName={comment.creatorInfo.groupRoleName ?? translate('Label.FormerMember')}
          createdTime={comment.createdAt}
        />
        <div className='group-forums-search-result-comment-content richtext-base'>
          {highlights?.body ? (
            <span>{renderHighlightedText(highlights.body)}</span>
          ) : (
            <Message content={comment.content} />
          )}
        </div>
      </div>
    </a>
  );
};

export default withTranslations(ForumsSearchResultComment, groupsConfig);
