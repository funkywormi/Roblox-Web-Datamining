import React, { FC, ReactNode, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { SystemFeedbackProvider } from 'react-style-guide';

import { EmotesProvider } from '../../shared/contexts/EmoteContext';
import { CommunityFeatureFreezesContextProvider } from '../../shared/contexts/CommunityFeatureFreezesContext';
import { ForumPermissionsProvider } from '../contexts/ForumPermissionsContext';
import { ModerateUserPermissionsProvider } from '../../shared/contexts/ModerateUserPermissionsContext';
import { GroupPermissions } from '../../shared/types';
import { ForumExperimentsProvider } from '../contexts/ForumExperimentsContext';
import GroupForumUpdates from './GroupForumUpdates';
import { ModerateDialogProvider } from '../../shared/contexts/ModerateDialogContext';
import { CommunityProductFeaturesContextProvider } from '../../shared/contexts/CommunityProductFeaturesContext';
import forumsService from '../services/forumsService';
import { getCategoriesKey } from '../services/queryKeys';
import useResolvedForumCategoryPermissions from '../hooks/useResolvedForumCategoryPermissions';

export type GroupForumsDiscoveryProps = {
  groupId: number;
  isEnabled: boolean;
  permissions: GroupPermissions;
  isGroupMember: boolean;
  isOwner: boolean;
};

const queryClient = new QueryClient();

type GroupForumsDiscoveryPermissionsBridgeProps = Pick<
  GroupForumsDiscoveryProps,
  'groupId' | 'permissions' | 'isGroupMember' | 'isOwner'
> & {
  children: ReactNode;
};

/**
 * Top community posts are mounted outside the main forum route, so they do not receive the
 * category permissions resolved by ForumProviders. Resolve them from the canonical endpoint here
 * before passing them to the shared permissions context.
 */
const GroupForumsDiscoveryPermissionsBridge: FC<GroupForumsDiscoveryPermissionsBridgeProps> = ({
  children,
  groupId,
  permissions,
  isGroupMember,
  isOwner
}) => {
  const { data: categories = [] } = useQuery({
    queryKey: getCategoriesKey(groupId),
    queryFn: async () => {
      const response = await forumsService.getGroupForumCategories(groupId, false);
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false
  });
  const categoryIds = useMemo(() => categories.map(category => category.id), [categories]);
  const { permissions: resolvedCategoryPermissions } = useResolvedForumCategoryPermissions({
    groupId,
    categoryIds
  });

  return (
    <ForumPermissionsProvider
      permissions={permissions}
      resolvedCategoryPermissions={resolvedCategoryPermissions}
      isGroupMember={isGroupMember}
      isOwner={isOwner}>
      {children}
    </ForumPermissionsProvider>
  );
};

const GroupForumsDiscovery = ({
  groupId,
  permissions,
  isGroupMember,
  isOwner,
  isEnabled
}: GroupForumsDiscoveryProps): JSX.Element | null => {
  if (!isEnabled) return null;
  if (!groupId) return null;

  return (
    <SystemFeedbackProvider>
      <QueryClientProvider client={queryClient}>
        <CommunityProductFeaturesContextProvider groupId={groupId}>
          <CommunityFeatureFreezesContextProvider groupId={groupId} isOwner={isOwner}>
            <EmotesProvider groupId={groupId}>
              <ForumExperimentsProvider>
                <ModerateDialogProvider>
                  <ModerateUserPermissionsProvider permissions={permissions}>
                    <GroupForumsDiscoveryPermissionsBridge
                      groupId={groupId}
                      permissions={permissions}
                      isGroupMember={isGroupMember}
                      isOwner={isOwner}>
                      <GroupForumUpdates groupId={groupId} />
                    </GroupForumsDiscoveryPermissionsBridge>
                  </ModerateUserPermissionsProvider>
                </ModerateDialogProvider>
              </ForumExperimentsProvider>
            </EmotesProvider>
          </CommunityFeatureFreezesContextProvider>
        </CommunityProductFeaturesContextProvider>
      </QueryClientProvider>
    </SystemFeedbackProvider>
  );
};

export default GroupForumsDiscovery;
