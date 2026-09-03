import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { groupsConfig } from '../translation.config';
import PostSkeleton from '../components/PostSkeleton';
import CommentsSection from './CommentsSection';
import CategoriesList from './CategoriesList';
import SectionHeader from '../../shared/components/SectionHeader';
import groupForumsConstants, { CommentVariants } from '../constants/groupForumsConstants';
import Comment from '../components/Comment';
import { PostProvider, usePost } from '../contexts/PostContext';
import { ComposerProvider, useComposer } from '../contexts/ComposerContext';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import PostNavigation from '../components/PostNavigation';
import useForumStore from '../hooks/useForumStore';
import CommentComposer from '../components/CommentComposer';
import DesktopPersistentComposer from '../components/DesktopPersistentComposer';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import usePostScrollEffects from '../hooks/usePostScrollEffects';
import { PostRouteMatchParams } from '../store/reduceNextRoute';
import AgeCheckWrapper from '../components/AgeCheckWrapper';
import { logGroupPageExposureEvent } from '../../shared/utils/logging';
import { EventTriggerReason, EventContext, EventType } from '../../shared/constants/eventConstants';
import useReplyDisabledState from '../hooks/useReplyDisabledState';
import ForumTierGateMessage from '../components/ForumTierGateMessage';

function NativeComposerOrTierGate({
  translate
}: {
  translate: WithTranslationsProps['translate'];
}): JSX.Element {
  const { disabled, showTierGate } = useReplyDisabledState({ translate });

  if (showTierGate) {
    return (
      <div className='group-forums-native-comment-composer'>
        <ForumTierGateMessage testId='forum-composer-tier-gate' />
      </div>
    );
  }

  return (
    <div className='group-forums-native-comment-composer'>
      <CommentComposer showCancelButton={false} disabled={disabled} />
    </div>
  );
}

export type PostProps = {} & WithTranslationsProps;

const Post = ({ translate }: WithTranslationsProps): JSX.Element => {
  const history = useHistory();
  const match = useRouteMatch<PostRouteMatchParams>();

  const { isLoadingPost, post, loadingPostError, fetchPost } = usePost();
  const { highlightedCommentId } = useComposer();
  const blockedUserList = useForumStore.use.blockedUserList();
  const categoryShortId = useForumStore.use.categoryShortId()!;
  const categoryName = useForumStore.use.categoryName()!;
  const useInlineReply = useForumStore.use.useInlineReply();
  const isCategoryArchived = useForumStore.use.isCategoryArchived();
  const isPostInaccessible = useForumStore.use.isPostInaccessible();

  const { canCreateComment } = useForumPermissions();

  const postScrollContainerRef = useRef<HTMLDivElement>(null);

  usePostScrollEffects({ postScrollContainerRef });

  const showNativeCommentComposer = useMemo(
    () =>
      canCreateComment &&
      !post?.isLocked &&
      !useInlineReply &&
      !isCategoryArchived &&
      !isPostInaccessible,
    [canCreateComment, post?.isLocked, useInlineReply, isCategoryArchived, isPostInaccessible]
  );

  const onBack = useCallback(() => {
    history.push(groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName));
  }, [categoryShortId, categoryName, history]);

  const onForceBack = useCallback(() => {
    history.replace(groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName));
  }, [categoryShortId, categoryName, history]);

  const onSelectCategory = useCallback(
    (nextCategoryShortId: string, nextCategoryName: string) => {
      history.push(
        groupForumsConstants.router.getCategoryRoute(nextCategoryShortId, nextCategoryName)
      );
    },
    [history]
  );

  useEffect(() => {
    // If we are on the page of a post which you blocked a user, navigate away from it.
    if (post?.createdBy && blockedUserList.includes(post.createdBy)) {
      history.replace(groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName));
    }
  }, [blockedUserList, post?.createdBy, categoryShortId, categoryName, history]);

  useEffect(() => {
    // redirect to default category if the category is not valid, unless the post is inaccessible
    if (
      !isPostInaccessible &&
      categoryShortId &&
      match.params.categoryShortId !== categoryShortId
    ) {
      history.replace(groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName));
    }
  }, [match, history, categoryShortId, categoryName, isPostInaccessible]);

  useEffect(() => {
    // if the post does not exist, navigate back to the category
    if (!isLoadingPost && !post && !loadingPostError) {
      onBack();
    }
  }, [isLoadingPost, loadingPostError, onBack, post]);

  useEffect(() => {
    if (post) {
      logGroupPageExposureEvent({
        groupId: post.groupId,
        context: EventContext.GroupForums,
        exposureType: EventType.GroupForumPostExposureEvent,
        exposureId: post.id
      });
    }
  }, [post]);

  const renderPostContent = () => {
    if (loadingPostError) {
      return (
        <SectionDisclaimer
          iconClassName='icon-status-alert'
          heading={translate('Error.LoadPostTitle')}
          message={translate('Error.ReloadingSubtitle')}
          buttonText={translate('Action.RetryLoadingPost')}
          onClick={fetchPost}
        />
      );
    }

    if (isPostInaccessible) {
      return (
        <SectionDisclaimer
          iconClassName='icon-status-alert'
          heading={translate('Heading.PostUnavailable')}
          message={translate('Description.PostUnavailable')}
        />
      );
    }

    if (isLoadingPost || !post) {
      return <PostSkeleton />;
    }

    return (
      <Comment
        title={post.name}
        variant={CommentVariants.Post}
        isActive={highlightedCommentId === post.firstComment.id}
        id={post.firstComment.id}
        createdBy={post.firstComment.createdBy}
        createdAt={post.firstComment.createdAt}
        updatedAt={post.firstComment.updatedAt}
        creatorInfo={post.firstComment.creatorInfo}
        content={post.firstComment.content}
        threadId={null}
        channelId={post.firstComment.parentId}
        reactions={post.firstComment.reactions}
        isConcealedAndShown={post.firstComment.isConcealed === true}
        onHidePost={onForceBack}
      />
    );
  };

  return (
    <div className='group-forums-post'>
      {isPostInaccessible ? (
        // Show the categories the user can access so they can navigate away from the unavailable post.
        <div className='group-forums-categories-list-container'>
          <CategoriesList activeCategoryId={null} onSetActiveCategory={onSelectCategory} />
        </div>
      ) : (
        <React.Fragment>
          <PostNavigation
            categoryName={categoryName}
            backRoute={groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName)}
            postTitle={post?.name}
            containerClassName='hide-on-native'
          />
          <SectionHeader
            headerText={categoryName}
            onBack={onBack}
            containerClassName='show-on-native'
          />
        </React.Fragment>
      )}
      <div className='group-forums-post-scroll-container' ref={postScrollContainerRef}>
        <div className='group-forums-post-content'>{renderPostContent()}</div>
        {!isLoadingPost && useInlineReply && (
          <div className='group-forums-post-comment-composer'>
            <AgeCheckWrapper trigger={EventTriggerReason.WriteComment}>
              <DesktopPersistentComposer />
            </AgeCheckWrapper>
          </div>
        )}
        {!isPostInaccessible && (
          <React.Fragment>
            <div className='group-forums-post-divider' />
            <div className='group-forums-post-comments-section'>
              <CommentsSection />
            </div>
          </React.Fragment>
        )}
      </div>
      {showNativeCommentComposer && <NativeComposerOrTierGate translate={translate} />}
    </div>
  );
};

const PostWithProvider = (props: PostProps) => (
  <PostProvider {...props}>
    <ComposerProvider>
      <Post {...props} />
    </ComposerProvider>
  </PostProvider>
);
export default withTranslations(PostWithProvider, groupsConfig);
