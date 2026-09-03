import React, { createContext, useContext, useMemo } from 'react';
import { ExperimentationService } from 'Roblox';
import { ForumPermissionsState, ForumPost } from '../types';
import { GroupPermissions, GroupChannelPermissions } from '../../shared/types';
import useForumStore from '../hooks/useForumStore';
import { useForumExperiments } from './ForumExperimentsContext';
import { layers } from '../../shared/constants/experimentConstants';

export const ForumPermissionsContext = createContext<ForumPermissionsState | undefined>(undefined);

export const useForumPermissions = (): ForumPermissionsState => {
  const resource = useContext(ForumPermissionsContext);
  if (!resource) {
    throw new Error('useForumPermissions must be used within a ForumPermissionsProvider');
  }
  return resource;
};

export type ForumPermissionsProviderProps = {
  permissions: GroupPermissions;
  channelsPermissions: GroupChannelPermissions[];
  isUnified?: boolean;
  resolvedCategoryPermissions?: Record<string, GroupPermissions['groupForumsPermissions']>;
  isGroupMember: boolean;
  // Derived by useCanViewMembers (see ForumPermissionsBridge) rather than piped in from Angular.
  // Defaults to denied, so a caller that never resolves it cannot open up member search.
  canViewMembers?: boolean;
  isOwner: boolean;
  children: React.ReactNode;
};

const deniedForumPermissions: GroupPermissions['groupForumsPermissions'] = {
  manageCategories: false,
  createPosts: false,
  removePosts: false,
  lockPosts: false,
  pinPosts: false,
  createComments: false,
  removeComments: false,
  createBugReports: false
};

export function ForumPermissionsProvider({
  children,
  permissions,
  channelsPermissions,
  isUnified = false,
  resolvedCategoryPermissions = {},
  isGroupMember,
  canViewMembers = false,
  isOwner
}: ForumPermissionsProviderProps): JSX.Element {
  const userId = useForumStore.use.userId();
  const categoryId = useForumStore.use.categoryId();
  const { subscriberNotificationsExperimentConfig } = useForumExperiments();

  const channelsPermissionsMap: Map<string, GroupChannelPermissions> = useMemo(() => {
    // Using channels permissions is flagged here because the channelsPermissions array will be null from the backend when this is flagged off
    return (channelsPermissions || []).reduce((acc, val) => {
      acc.set(val.channelId, val);
      return acc;
    }, new Map<string, GroupChannelPermissions>());
  }, [channelsPermissions]);

  const getForumCategoryPermissions = (forumCategoryId: string) => {
    if (isUnified) {
      return resolvedCategoryPermissions[forumCategoryId] ?? deniedForumPermissions;
    }
    return (
      channelsPermissionsMap.get(forumCategoryId)?.groupForumsPermissions ||
      permissions.groupForumsPermissions
    );
  };

  let forumsPermissions = isUnified ? deniedForumPermissions : permissions.groupForumsPermissions;
  if (categoryId) {
    forumsPermissions = getForumCategoryPermissions(categoryId);
  }

  const canDeletePost = (authorId: number) => {
    return (forumsPermissions.createPosts && authorId === userId) || forumsPermissions.removePosts;
  };

  const canDeleteComment = (authorId: number) => {
    return (
      (forumsPermissions.createComments && authorId === userId) || forumsPermissions.removeComments
    );
  };

  const canPreventSimilarPost = isOwner;
  const canPreventSimilarComment = isOwner;

  const canEditPost = (authorId: number) => {
    return forumsPermissions.createPosts && authorId === userId;
  };

  const canEditComment = (authorId: number) => {
    return forumsPermissions.createComments && authorId === userId;
  };

  const canLockPost = (post: ForumPost) => {
    const { createdBy: authorId, isLocked, lockedBy } = post;

    // The author can lock their own posts
    if (authorId === userId) {
      if (isLocked && lockedBy !== userId) {
        return false; // If the post was locked by someone else, they cannot unlock it
      }

      return true;
    }

    if (lockedBy === authorId) {
      return false; // The author locked their own post, so the moderator cannot unlock it
    }

    // Allow moderators to lock posts
    return forumsPermissions.lockPosts;
  };

  const canSubscribe = (authorId: number) => {
    return (
      authorId !== userId &&
      !Number.isNaN(userId) &&
      userId !== 0 &&
      !!subscriberNotificationsExperimentConfig?.isReceived // Users not in the notifications treatment should not see a subscribe button
    );
  };

  const canCreatePostInCategory = (forumCategoryId: string) => {
    return getForumCategoryPermissions(forumCategoryId).createPosts;
  };

  const canAttachSupportTicketInCategory = (forumCategoryId: string) => {
    return !!getForumCategoryPermissions(forumCategoryId).createBugReports;
  };

  return (
    <ForumPermissionsContext.Provider
      value={{
        canCreatePost: forumsPermissions.createPosts,
        canCreatePostInCategory,
        canAttachSupportTicketInCategory,
        canCreateComment: forumsPermissions.createComments,
        canPinPost: forumsPermissions.pinPosts,
        canLockPost,
        canEditPost,
        canEditComment,
        canDeletePost,
        canDeleteComment,
        canPreventSimilarPost,
        canPreventSimilarComment,
        canReact: isGroupMember,
        canSubscribe,
        isGroupMember,
        canViewMembers
      }}>
      {children}
    </ForumPermissionsContext.Provider>
  );
}
