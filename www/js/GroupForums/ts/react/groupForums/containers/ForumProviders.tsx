import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GroupPermissions, GroupChannelPermissions } from '../../shared/types';
import { ForumPermissionsProvider } from '../contexts/ForumPermissionsContext';
import { ForumExperimentsProvider } from '../contexts/ForumExperimentsContext';
import useForumStore from '../hooks/useForumStore';
import useResolvedForumCategoryPermissions from '../hooks/useResolvedForumCategoryPermissions';
import useCanViewMembers from '../../shared/hooks/useCanViewMembers';

export type ForumProvidersProps = {
  children: ReactNode;
  permissions: GroupPermissions;
  channelsPermissions: GroupChannelPermissions[];
  groupId: number;
  isGroupMember: boolean;
  isOwner: boolean;
};

const forumsQueryClient = new QueryClient();

type ForumPermissionsBridgeProps = Pick<
  ForumProvidersProps,
  'children' | 'permissions' | 'channelsPermissions' | 'groupId' | 'isGroupMember' | 'isOwner'
>;

const ForumPermissionsBridge: FC<ForumPermissionsBridgeProps> = ({
  children,
  permissions,
  channelsPermissions,
  groupId,
  isGroupMember,
  isOwner
}) => {
  const categories = useForumStore.use.categories();
  const archivedCategories = useForumStore.use.archivedCategories();
  const categoryId = useForumStore.use.categoryId();
  const canViewMembers = useCanViewMembers(groupId);
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();
  const categoryIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...(channelsPermissions || []).map(channelPermissions => channelPermissions.channelId),
          ...categories.map(category => category.id),
          ...archivedCategories.map(category => category.id),
          ...(categoryId ? [categoryId] : [])
        ])
      ),
    [archivedCategories, categories, categoryId, channelsPermissions]
  );
  const {
    permissions: resolvedCategoryPermissions,
    hasCurrentCategoryPermissionError: hasCategoryPermissionError
  } = useResolvedForumCategoryPermissions({
    groupId,
    categoryIds,
    currentCategoryId: categoryId
  });

  useEffect(() => {
    if (hasCategoryPermissionError) {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  }, [hasCategoryPermissionError, systemFeedbackService, translate]);
  return (
    <ForumPermissionsProvider
      permissions={permissions}
      resolvedCategoryPermissions={resolvedCategoryPermissions}
      isGroupMember={isGroupMember}
      canViewMembers={canViewMembers}
      isOwner={isOwner}>
      {children}
    </ForumPermissionsProvider>
  );
};

const ForumProviders: FC<ForumProvidersProps> = ({
  children,
  permissions,
  channelsPermissions,
  groupId,
  isGroupMember,
  isOwner
}) => (
  <ForumExperimentsProvider>
    <ForumPermissionsBridge
      groupId={groupId}
      permissions={permissions}
      channelsPermissions={channelsPermissions}
      isGroupMember={isGroupMember}
      isOwner={isOwner}>
      <QueryClientProvider client={forumsQueryClient}>{children}</QueryClientProvider>
    </ForumPermissionsBridge>
  </ForumExperimentsProvider>
);

export default ForumProviders;
