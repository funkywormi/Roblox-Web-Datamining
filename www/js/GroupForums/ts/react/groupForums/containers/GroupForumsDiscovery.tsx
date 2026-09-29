import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SystemFeedbackProvider } from 'react-style-guide';

import { EmotesProvider } from '../../shared/contexts/EmoteContext';
import { CommunityFeatureFreezesContextProvider } from '../../shared/contexts/CommunityFeatureFreezesContext';
import { ForumPermissionsProvider } from '../contexts/ForumPermissionsContext';
import { ModerateUserPermissionsProvider } from '../../shared/contexts/ModerateUserPermissionsContext';
import { GroupPermissions, GroupChannelPermissions } from '../../shared/types';
import { ForumExperimentsProvider } from '../contexts/ForumExperimentsContext';
import GroupForumUpdates from './GroupForumUpdates';
import { ModerateDialogProvider } from '../../shared/contexts/ModerateDialogContext';
import { CommunityProductFeaturesContextProvider } from '../../shared/contexts/CommunityProductFeaturesContext';

export type GroupForumsDiscoveryProps = {
  groupId: number;
  isEnabled: boolean;
  permissions: GroupPermissions;
  channelsPermissions: GroupChannelPermissions[];
  isGroupMember: boolean;
  isOwner: boolean;
};

const queryClient = new QueryClient();

const GroupForumsDiscovery = ({
  groupId,
  permissions,
  channelsPermissions,
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
                    <ForumPermissionsProvider
                      permissions={permissions}
                      channelsPermissions={channelsPermissions}
                      isGroupMember={isGroupMember}
                      isOwner={isOwner}>
                      <GroupForumUpdates groupId={groupId} />
                    </ForumPermissionsProvider>
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
