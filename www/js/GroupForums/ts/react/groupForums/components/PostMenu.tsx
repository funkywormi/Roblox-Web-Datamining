import { CurrentUser } from 'Roblox';
import React, { useCallback, useMemo, useState } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { Menu, MenuSection, Popover, PopoverContent } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useHistory } from 'react-router-dom';
import '../../../../css/tailwind.css';
import { groupsConfig } from '../translation.config';
import groupForumsConstants from '../constants/groupForumsConstants';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import { useModerateUserPermissions } from '../../shared/contexts/ModerateUserPermissionsContext';
import { ForumPost, NotificationPreferenceType } from '../types';
import DropdownMenuItem, {
  DropdownMenuCloseContext
} from '../../shared/components/DropdownMenuItem';
import MenuTrigger from '../../shared/components/MenuTrigger';
import forumsService from '../services/forumsService';
import { useModerateDialog } from '../../shared/contexts/ModerateDialogContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import guacService from '../../shared/services/guacService';
import useForumStore from '../hooks/useForumStore';
import useGuacConfig from '../../shared/hooks/useGuacConfig';

export const POST_MENU_CLASS = 'group-forums-post-dropdown-menu';

export type PostMenuProps = {
  post: ForumPost;
  onRefetchPosts?: () => void;
  onHidePost?: () => void;
  onDelete?: () => void;
  onSubscribe: () => void;
  button: JSX.Element;
} & WithTranslationsProps;

const PostMenu = ({
  post,
  onRefetchPosts,
  onHidePost,
  onDelete,
  onSubscribe,
  button,
  translate
}: PostMenuProps): JSX.Element => {
  const history = useHistory();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(open => !open), []);
  const {
    canEditPost,
    canDeletePost,
    canPreventSimilarPost,
    canLockPost,
    canPinPost,
    canSubscribe
  } = useForumPermissions();
  const { canKickUser, canBanUser, canBlockUser } = useModerateUserPermissions();
  const moderateDialog = useModerateDialog();
  const {
    openBanDialog,
    openKickDialog,
    openBlockDialog,
    openHidePostDialog,
    openDeletePostDialog
  } = moderateDialog;
  const { features } = useCommunityProductFeatures();
  const { isLoading, data: groupDetailsUi } = useGuacConfig('group-details-ui');

  const isCategoryArchived = useForumStore.use.isCategoryArchived();
  const { systemFeedbackService } = useSystemFeedback();
  const categoryName = useForumStore.use.categoryName();
  const categoryShortId = useForumStore.use.categoryShortId()!;

  const showEditPost = useMemo(
    () => canEditPost(post.createdBy) && !post.isLocked && !isCategoryArchived,
    [canEditPost, post.createdBy, post.isLocked, isCategoryArchived]
  );
  const showDeletePost = useMemo(() => canDeletePost(post.createdBy) && !isCategoryArchived, [
    canDeletePost,
    post.createdBy,
    isCategoryArchived
  ]);

  const showLockPost = useMemo(() => canLockPost(post) && !isCategoryArchived, [
    canLockPost,
    post,
    isCategoryArchived
  ]);

  const showPinPost = useMemo(() => canPinPost && !isCategoryArchived, [
    canPinPost,
    isCategoryArchived
  ]);

  const showBlockUser = useMemo(() => canBlockUser(post.createdBy), [canBlockUser, post.createdBy]);
  const showSubscribe = useMemo(() => canSubscribe(post.createdBy), [canSubscribe, post.createdBy]);
  const showKickUser = useMemo(() => canKickUser(post.createdBy), [canKickUser, post.createdBy]);
  const showBanUser = useMemo(() => canBanUser(post.createdBy), [canBanUser, post.createdBy]);
  const isHideButtonEnabled = useMemo(
    () => !isLoading && !!groupDetailsUi?.isHideCommentButtonVisible,
    [isLoading, groupDetailsUi]
  );
  const showHidePost =
    isHideButtonEnabled &&
    !(CurrentUser.userId && parseInt(CurrentUser.userId, 10) === post.createdBy);

  const handleEditPost = () => {
    history.push(groupForumsConstants.router.getPostEditRoute(categoryShortId, post.id));
  };

  const handleTogglePin = useCallback(async () => {
    try {
      await forumsService.toggleGroupForumPostPin(
        post.groupId,
        post.categoryId,
        post.id,
        !post.isPinned
      );
      onRefetchPosts?.();
      if (post.isPinned) {
        systemFeedbackService.success(translate('Label.PostUnpinned'));
      } else {
        systemFeedbackService.success(translate('Label.PostPinned'));
      }
    } catch {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  }, [
    post.groupId,
    post.categoryId,
    post.id,
    post.isPinned,
    onRefetchPosts,
    systemFeedbackService,
    translate
  ]);

  const handleToggleLock = useCallback(async () => {
    try {
      await forumsService.toggleGroupForumPostLock(
        post.groupId,
        post.categoryId,
        post.id,
        !post.isLocked
      );
      onRefetchPosts?.();
      if (post.isLocked) {
        systemFeedbackService.success(translate('Label.PostUnlocked'));
      } else {
        systemFeedbackService.success(translate('Label.PostLocked'));
      }
    } catch {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  }, [
    post.groupId,
    post.categoryId,
    post.id,
    post.isLocked,
    onRefetchPosts,
    systemFeedbackService,
    translate
  ]);

  const deletePost = useCallback(
    async (preventSimilar = false) => {
      try {
        await forumsService.deleteGroupForumPost(
          post.groupId,
          post.categoryId,
          post.id,
          preventSimilar
        );
        onDelete?.();
        systemFeedbackService.success(translate('Label.PostDeleted'));
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
      }
    },
    [post.groupId, post.categoryId, post.id, onDelete, systemFeedbackService, translate]
  );

  const isDeletingOthersPost = !(
    CurrentUser.userId && parseInt(CurrentUser.userId, 10) === post.createdBy
  );
  const showPreventSimilarPost =
    canPreventSimilarPost && features.ForumPreventSimilar && isDeletingOthersPost;

  const handleDeletePost = useCallback(() => {
    openDeletePostDialog({
      showPreventSimilar: showPreventSimilarPost,
      onConfirmDelete: deletePost
    });
  }, [openDeletePostDialog, showPreventSimilarPost, deletePost]);

  const onBanUser = useCallback(() => {
    openBanDialog({
      groupId: post.groupId,
      userId: post.createdBy,
      onDeletePosts: onDelete
    });
  }, [post.createdBy, post.groupId, openBanDialog, onDelete]);

  const onKickUser = useCallback(() => {
    openKickDialog({
      groupId: post.groupId,
      userId: post.createdBy,
      onDeletePosts: onDelete
    });
  }, [post.createdBy, post.groupId, openKickDialog, onDelete]);

  const handleCopyLink = useCallback(async () => {
    if (navigator.clipboard) {
      try {
        const postUrl = groupForumsConstants.deepLinks.groupForumPostUrl(
          post.groupId,
          categoryShortId,
          categoryName || 'category',
          post.shortId,
          post.name
        );
        await navigator.clipboard.writeText(postUrl);
        systemFeedbackService.success(translate('Label.LinkCopied'));
      } catch {
        systemFeedbackService.warning(translate('Error.CopyLink'));
      }
    }
  }, [post.categoryId, post.groupId, post.id, post.name, systemFeedbackService, translate]);

  const handleReportPost = useCallback(async () => {
    const config = await guacService.getAbuseReportRevampPolicyNonThrowing();
    if (config.EnableGroupPost) {
      const reportUrl = groupForumsConstants.urls.reportAbuseRevamp({
        targetId: post.groupId.toString(),
        submitterId: CurrentUser.userId,
        abuseVector: 'groupforumcomment',
        custom: {
          stringId: post.firstComment.id,
          forumPostId: post.id,
          conversationId: post.id
        }
      });
      window.location.href = reportUrl;
      return;
    }

    const reportUrl = groupForumsConstants.urls.reportAbuse(
      post.groupId,
      post.id,
      post.id,
      post.firstComment.id,
      true
    );
    window.location.href = reportUrl;
  }, [post.firstComment.id, post.groupId, post.id]);

  const handleHidePost = useCallback(() => {
    const rootCommentId = post?.firstComment?.id;
    if (!rootCommentId) return;
    openHidePostDialog({
      groupId: post.groupId,
      categoryId: post.categoryId,
      postId: post.id,
      threadId: post.categoryId,
      commentId: rootCommentId,
      onHideSuccess: onHidePost
    });
  }, [
    openHidePostDialog,
    onHidePost,
    post.categoryId,
    post.firstComment?.id,
    post.groupId,
    post.id
  ]);

  const onBlockUser = () => {
    openBlockDialog(post.createdBy);
  };

  const isSubscribed = post.notificationPreference === NotificationPreferenceType.All;

  return (
    <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <MenuTrigger button={button} onToggle={toggleMenu} />
      <PopoverContent ariaLabel={translate('Label.OverflowMenu')} side='bottom' align='end'>
        <DropdownMenuCloseContext.Provider value={closeMenu}>
          <Menu className={POST_MENU_CLASS} size='Medium'>
            <MenuSection>
              {showEditPost && (
                <DropdownMenuItem translateKey='Label.EditPost' action={handleEditPost} />
              )}
              {showPinPost && (
                <DropdownMenuItem
                  translateKey={post.isPinned ? 'Label.UnpinPost' : 'Label.PinPost'}
                  action={handleTogglePin}
                />
              )}
              {showLockPost && (
                <DropdownMenuItem
                  translateKey={post.isLocked ? 'Label.UnlockPost' : 'Label.LockPost'}
                  action={handleToggleLock}
                />
              )}
              {showDeletePost && (
                <DropdownMenuItem translateKey='Label.DeletePost' action={handleDeletePost} />
              )}
              {showKickUser && (
                <DropdownMenuItem translateKey='Action.KickUser' action={onKickUser} />
              )}
              {showBanUser && <DropdownMenuItem translateKey='Action.BanUser' action={onBanUser} />}
              {navigator.clipboard && (
                <DropdownMenuItem translateKey='Label.CopyLink' action={handleCopyLink} />
              )}
              {showSubscribe && (
                <DropdownMenuItem
                  translateKey={
                    isSubscribed ? 'Label.UnsubscribeFromPost' : 'Label.SubscribeToPost'
                  }
                  action={onSubscribe}
                  disabled={post.notificationPreference === undefined}
                />
              )}
              {showBlockUser && (
                <DropdownMenuItem translateKey='Label.BlockUser' action={onBlockUser} />
              )}
              {showHidePost && (
                <DropdownMenuItem translateKey='Action.HidePost' action={handleHidePost} />
              )}
              <DropdownMenuItem translateKey='Label.ReportAbuse' action={handleReportPost} />
            </MenuSection>
          </Menu>
        </DropdownMenuCloseContext.Provider>
      </PopoverContent>
    </Popover>
  );
};

export default withTranslations(PostMenu, groupsConfig);
