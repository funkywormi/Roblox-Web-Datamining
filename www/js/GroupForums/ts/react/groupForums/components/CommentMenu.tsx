import { CurrentUser } from 'Roblox';
import React, { useCallback, useMemo, useState } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { Menu, MenuSection, Popover, PopoverContent } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import '../../../../css/tailwind.css';
import { groupsConfig } from '../translation.config';
import groupForumsConstants from '../constants/groupForumsConstants';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import { useModerateUserPermissions } from '../../shared/contexts/ModerateUserPermissionsContext';
import DropdownMenuItem, {
  DropdownMenuCloseContext
} from '../../shared/components/DropdownMenuItem';
import MenuTrigger from '../../shared/components/MenuTrigger';
import { usePost } from '../contexts/PostContext';
import { useComposer } from '../contexts/ComposerContext';
import { ForumCommentsResponse, NotificationPreferenceType } from '../types';
import useForumStore from '../hooks/useForumStore';
import { useModerateDialog } from '../../shared/contexts/ModerateDialogContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { getCommentRepliesKey } from '../services/queryKeys';
import guacService from '../../shared/services/guacService';
import useGuacConfig from '../../shared/hooks/useGuacConfig';

export type CommentMenuProps = {
  createdBy: number;
  commentId: string;
  button: JSX.Element;
  isReply: boolean;
  parentCommentId?: string;
  threadId: string | null;
  channelId: string;
  isPostLocked: boolean;
  onSubscribe: () => void;
} & WithTranslationsProps;

const CommentMenu = ({
  createdBy,
  commentId,
  button,
  isReply,
  parentCommentId,
  channelId,
  isPostLocked,
  onSubscribe,
  translate
}: CommentMenuProps): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(open => !open), []);
  const { canEditComment, canDeleteComment, canPreventSimilarComment } = useForumPermissions();
  const { canBanUser, canKickUser, canBlockUser } = useModerateUserPermissions();
  const moderateDialog = useModerateDialog();
  const {
    openBanDialog,
    openKickDialog,
    openBlockDialog,
    openHideCommentDialog,
    openDeleteCommentDialog
  } = moderateDialog;
  const { features } = useCommunityProductFeatures();
  const { isLoading, data: groupDetailsUi } = useGuacConfig('group-details-ui');
  const groupId = useForumStore.use.groupId();
  const categoryShortId = useForumStore.use.categoryShortId()!;
  const categoryId = useForumStore.use.categoryId()!;
  const categoryName = useForumStore.use.categoryName()!;
  const postId = useForumStore.use.postId()!;
  const isCategoryArchived = useForumStore.use.isCategoryArchived();
  const postShortId = useForumStore.use.postShortId()!;
  const { comments, handleDeleteComment, post, removeComment } = usePost();
  const { setEditComment } = useComposer();
  const { systemFeedbackService } = useSystemFeedback();
  const queryClient = useQueryClient();

  const showEditComment = useMemo(
    () => canEditComment(createdBy) && !isPostLocked && !isCategoryArchived,
    [canEditComment, createdBy, isPostLocked, isCategoryArchived]
  );
  const showBlockUser = useMemo(() => canBlockUser(createdBy), [canBlockUser, createdBy]);
  const showDeleteComment = useMemo(() => canDeleteComment(createdBy) && !isCategoryArchived, [
    canDeleteComment,
    createdBy,
    isCategoryArchived
  ]);
  const showBanUser = useMemo(() => canBanUser(createdBy), [canBanUser, createdBy]);
  const showKickUser = useMemo(() => canKickUser(createdBy), [canKickUser, createdBy]);

  // we have no ETA for launching subscribing to comments, so decouple from canSubscribe to be safe
  const showSubscribe = false; // useMemo(() => canSubscribe(createdBy), [canSubscribe, createdBy]);
  const isHideButtonEnabled = useMemo(
    () => !isLoading && !!groupDetailsUi?.isHideCommentButtonVisible,
    [isLoading, groupDetailsUi]
  );
  const showHidePost =
    isHideButtonEnabled && !(CurrentUser.userId && parseInt(CurrentUser.userId, 10) === createdBy);

  const handleEditComment = useCallback(() => {
    setEditComment(commentId, parentCommentId);
  }, [commentId, parentCommentId, setEditComment]);

  const deleteComment = useCallback(
    async (preventSimilar = false) => {
      const success = await handleDeleteComment(commentId, parentCommentId, preventSimilar);
      if (!success) {
        systemFeedbackService.warning(translate('NetworkError'));
      }

      // remove from query cache
      if (isReply) {
        const parentComment = comments.find(c => c.id === parentCommentId);
        const queryKey = getCommentRepliesKey(groupId, categoryId, parentComment?.threadId || '');
        const repliesCache = queryClient.getQueryData<InfiniteData<ForumCommentsResponse>>(
          queryKey
        );
        if (repliesCache) {
          const updatedList: ForumCommentsResponse[] =
            repliesCache.pages.map(page => ({
              ...page,
              data: page.data.filter(val => val.id !== commentId)
            })) ?? [];
          queryClient.setQueryData(
            queryKey,
            (data: InfiniteData<ForumCommentsResponse> | undefined) =>
              ({
                pages: updatedList,
                pageParams: data?.pageParams
              } as InfiniteData<ForumCommentsResponse>)
          );
        }
      }
    },
    [
      handleDeleteComment,
      commentId,
      parentCommentId,
      systemFeedbackService,
      translate,
      isReply,
      groupId,
      categoryId,
      queryClient,
      comments
    ]
  );

  const isDeletingOthersComment = !(
    CurrentUser.userId && parseInt(CurrentUser.userId, 10) === createdBy
  );
  const showPreventSimilarComment =
    canPreventSimilarComment && features.ForumPreventSimilar && isDeletingOthersComment;

  const onDeleteComment = useCallback(() => {
    openDeleteCommentDialog({
      isReply,
      showPreventSimilar: showPreventSimilarComment,
      onConfirmDelete: deleteComment
    });
  }, [openDeleteCommentDialog, isReply, showPreventSimilarComment, deleteComment]);

  const handleCopyLink = useCallback(async () => {
    if (navigator.clipboard) {
      try {
        const commentUrl = groupForumsConstants.deepLinks.groupForumCommentUrl(
          groupId,
          categoryShortId,
          categoryName,
          postShortId,
          isReply ? channelId : post?.name || '',
          commentId
        );
        await navigator.clipboard.writeText(commentUrl);
        systemFeedbackService.success(translate('Label.LinkCopied'));
      } catch {
        systemFeedbackService.warning(translate('Error.CopyLink'));
      }
    }
  }, [
    categoryId,
    commentId,
    groupId,
    postId,
    systemFeedbackService,
    translate,
    isReply,
    channelId
  ]);

  const handleReport = useCallback(async () => {
    const config = await guacService.getAbuseReportRevampPolicyNonThrowing();
    if (config.EnableGroupComment) {
      const reportUrl = groupForumsConstants.urls.reportAbuseRevamp({
        targetId: groupId.toString(),
        submitterId: CurrentUser.userId,
        abuseVector: 'groupforumcomment',
        custom: {
          stringId: commentId,
          conversationId: channelId,
          forumPostId: postId
        }
      });
      window.location.href = reportUrl;
      return;
    }

    const reportUrl = groupForumsConstants.urls.reportAbuse(
      groupId,
      postId,
      channelId,
      commentId,
      true
    );
    window.location.href = reportUrl;
  }, [commentId, groupId, postId, channelId]);

  const handleHideComment = useCallback(() => {
    const onHideSuccess = () => {
      if (isReply) {
        const parentComment = comments.find(c => c.id === parentCommentId);
        const queryKey = getCommentRepliesKey(groupId, categoryId, parentComment?.threadId || '');
        const repliesCache = queryClient.getQueryData<InfiniteData<ForumCommentsResponse>>(
          queryKey
        );
        if (repliesCache) {
          const updatedList: ForumCommentsResponse[] =
            repliesCache.pages.map(page => ({
              ...page,
              data: page.data.filter(val => val.id !== commentId)
            })) ?? [];
          queryClient.setQueryData(
            queryKey,
            (data: InfiniteData<ForumCommentsResponse> | undefined) =>
              ({
                pages: updatedList,
                pageParams: data?.pageParams
              } as InfiniteData<ForumCommentsResponse>)
          );
        }
      }

      removeComment(commentId);
    };

    openHideCommentDialog({
      groupId,
      categoryId,
      postId,
      threadId: channelId,
      commentId,
      onHideSuccess
    });
  }, [
    categoryId,
    commentId,
    channelId,
    comments,
    groupId,
    isReply,
    openHideCommentDialog,
    parentCommentId,
    postId,
    queryClient,
    removeComment
  ]);

  const [isSubscribed, isSubscriptionLoaded] = useMemo(() => {
    const comment = comments.find(c => c.id === commentId);
    return [
      comment?.notificationPreference === NotificationPreferenceType.All,
      comment?.notificationPreference !== undefined
    ];
  }, [comments, commentId]);

  const onBlockUser = () => {
    openBlockDialog(createdBy);
  };

  const onKickUser = useCallback(() => {
    openKickDialog({
      groupId,
      userId: createdBy,
      onDeletePosts: deleteComment
    });
  }, [createdBy, groupId, openKickDialog, deleteComment]);

  const onBanUser = useCallback(() => {
    openBanDialog({
      groupId,
      userId: createdBy,
      onDeletePosts: deleteComment
    });
  }, [createdBy, groupId, openBanDialog, deleteComment]);

  return (
    <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <MenuTrigger button={button} onToggle={toggleMenu} />
      <PopoverContent ariaLabel={translate('Label.OverflowMenu')} side='bottom' align='end'>
        <DropdownMenuCloseContext.Provider value={closeMenu}>
          <Menu className='group-forums-comment-dropdown-menu' size='Medium'>
            <MenuSection>
              {showEditComment && (
                <DropdownMenuItem
                  translateKey={isReply ? 'Label.EditReply' : 'Label.EditComment'}
                  action={handleEditComment}
                />
              )}
              {showDeleteComment && (
                <DropdownMenuItem
                  translateKey={isReply ? 'Label.DeleteReply' : 'Label.DeleteComment'}
                  action={onDeleteComment}
                />
              )}
              {showKickUser && (
                <DropdownMenuItem translateKey='Action.KickUser' action={onKickUser} />
              )}
              {showBanUser && <DropdownMenuItem translateKey='Action.BanUser' action={onBanUser} />}
              {navigator.clipboard && (
                <DropdownMenuItem translateKey='Label.CopyLink' action={handleCopyLink} />
              )}
              {showBlockUser && (
                <DropdownMenuItem translateKey='Label.BlockUser' action={onBlockUser} />
              )}
              {showSubscribe && (
                <DropdownMenuItem
                  translateKey={
                    isSubscribed ? 'Label.UnsubscribeFromComment' : 'Label.SubscribeToComment'
                  }
                  action={onSubscribe}
                  disabled={!isSubscriptionLoaded}
                />
              )}
              {showHidePost && (
                <DropdownMenuItem translateKey='Action.HideComment' action={handleHideComment} />
              )}
              <DropdownMenuItem translateKey='Label.ReportAbuse' action={handleReport} />
            </MenuSection>
          </Menu>
        </DropdownMenuCloseContext.Provider>
      </PopoverContent>
    </Popover>
  );
};

export default withTranslations(CommentMenu, groupsConfig);
