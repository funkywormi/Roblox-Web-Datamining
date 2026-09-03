import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import { HashRouter } from 'react-router-dom';
import { useTranslation } from 'react-utilities';
import { SystemFeedbackProvider, useSystemFeedback } from 'react-style-guide';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MIGRATION_STATUS, useGetMigrationStatus } from '@rbx/group-management';
import { GroupPermissions, GroupChannelPermissions } from '../../shared/types';
import { ForumPermissionsProvider } from '../contexts/ForumPermissionsContext';
import { ModerateUserPermissionsProvider } from '../../shared/contexts/ModerateUserPermissionsContext';
import { ModerateDialogProvider } from '../../shared/contexts/ModerateDialogContext';
import { EmotesProvider } from '../../shared/contexts/EmoteContext';
import useViewportSize from '../../shared/hooks/useViewportSize';
import { ForumExperimentsProvider } from '../contexts/ForumExperimentsContext';
import useForumStore from '../hooks/useForumStore';
import {
  CommunityProductFeaturesContextProvider,
  useCommunityProductFeatures
} from '../../shared/contexts/CommunityProductFeaturesContext';
import { CommunityFeatureFreezesContextProvider } from '../../shared/contexts/CommunityFeatureFreezesContext';
import { RealtimeProvider } from '../../shared/contexts/RealtimeContext';
import useResolvedForumCategoryPermissions from '../hooks/useResolvedForumCategoryPermissions';
import useCanViewMembers from '../../shared/hooks/useCanViewMembers';

export type Props = {
  children: ReactNode;
  permissions: GroupPermissions;
  channelsPermissions: GroupChannelPermissions[];
  userId: number;
  groupId: number;
  isGroupMember: boolean;
  isOwner: boolean;
};

const queryClient = new QueryClient();

type ForumPermissionsBridgeProps = Pick<
  Props,
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
  const { features, isLoading: areProductFeaturesLoading } = useCommunityProductFeatures();
  const { data: migrationStatus, isLoading: isMigrationStatusLoading } = useGetMigrationStatus(
    groupId,
    {
      enabled: features.IsUnifiedUIEnabled === true
    }
  );
  const isUnified =
    features.IsUnifiedUIEnabled === true && migrationStatus?.status === MIGRATION_STATUS.MIGRATED;
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
    currentCategoryId: categoryId,
    enabled: isUnified
  });

  useEffect(() => {
    if (hasCategoryPermissionError) {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  }, [hasCategoryPermissionError, systemFeedbackService, translate]);

  if (
    areProductFeaturesLoading ||
    (features.IsUnifiedUIEnabled === true && isMigrationStatusLoading)
  ) {
    return null;
  }

  return (
    <ForumPermissionsProvider
      permissions={permissions}
      channelsPermissions={channelsPermissions}
      isUnified={isUnified}
      resolvedCategoryPermissions={resolvedCategoryPermissions}
      isGroupMember={isGroupMember}
      canViewMembers={canViewMembers}
      isOwner={isOwner}>
      {children}
    </ForumPermissionsProvider>
  );
};

const Providers: FC<Props> = ({
  children,
  permissions,
  channelsPermissions,
  groupId,
  userId,
  isGroupMember,
  isOwner
}) => {
  const { isSmallViewport } = useViewportSize();
  const hydrate = useForumStore.use.hydrate();

  // hydrate store
  useEffect(() => {
    hydrate({ groupId, userId, useInlineReply: !isSmallViewport });
  }, [isSmallViewport, groupId, userId, hydrate]);

  // Hash Type "hashbang" is needed to handle the #!/ in the url for group details tabs
  return (
    <SystemFeedbackProvider>
      <RealtimeProvider>
        <QueryClientProvider client={queryClient}>
          <CommunityProductFeaturesContextProvider groupId={groupId}>
            <CommunityFeatureFreezesContextProvider groupId={groupId} isOwner={isOwner}>
              <EmotesProvider groupId={groupId}>
                <ForumExperimentsProvider>
                  <ModerateDialogProvider>
                    <ModerateUserPermissionsProvider permissions={permissions}>
                      <ForumPermissionsBridge
                        groupId={groupId}
                        permissions={permissions}
                        channelsPermissions={channelsPermissions}
                        isGroupMember={isGroupMember}
                        isOwner={isOwner}>
                        <HashRouter hashType='hashbang'>{children}</HashRouter>
                      </ForumPermissionsBridge>
                    </ModerateUserPermissionsProvider>
                  </ModerateDialogProvider>
                </ForumExperimentsProvider>
              </EmotesProvider>
            </CommunityFeatureFreezesContextProvider>
          </CommunityProductFeaturesContextProvider>
        </QueryClientProvider>
      </RealtimeProvider>
    </SystemFeedbackProvider>
  );
};

export default Providers;
