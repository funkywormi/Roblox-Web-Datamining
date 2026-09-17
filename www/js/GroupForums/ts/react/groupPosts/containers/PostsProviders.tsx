import React, { FC, ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';
import { queryClient } from 'react-utilities';
import { QueryClientProvider } from '@tanstack/react-query';
import { SystemFeedbackProvider } from 'react-style-guide';
import { GroupPermissions } from '../../shared/types';
import { ModerateUserPermissionsProvider } from '../../shared/contexts/ModerateUserPermissionsContext';
import { ModerateDialogProvider } from '../../shared/contexts/ModerateDialogContext';
import { EmotesProvider } from '../../shared/contexts/EmoteContext';
import { CommunityProductFeaturesContextProvider } from '../../shared/contexts/CommunityProductFeaturesContext';
import { CommunityFeatureFreezesContextProvider } from '../../shared/contexts/CommunityFeatureFreezesContext';
import { RealtimeProvider } from '../../shared/contexts/RealtimeContext';

type PostsProvidersProps = {
  children: ReactNode;
  permissions: GroupPermissions;
  groupId: number;
  isOwner: boolean;
};

const PostsProviders: FC<PostsProvidersProps> = ({ children, permissions, groupId, isOwner }) => (
  <SystemFeedbackProvider>
    <RealtimeProvider>
      <QueryClientProvider client={queryClient}>
        <CommunityProductFeaturesContextProvider groupId={groupId}>
          <CommunityFeatureFreezesContextProvider groupId={groupId} isOwner={isOwner}>
            <EmotesProvider groupId={groupId}>
              <ModerateDialogProvider>
                <ModerateUserPermissionsProvider permissions={permissions}>
                  <HashRouter hashType='hashbang'>{children}</HashRouter>
                </ModerateUserPermissionsProvider>
              </ModerateDialogProvider>
            </EmotesProvider>
          </CommunityFeatureFreezesContextProvider>
        </CommunityProductFeaturesContextProvider>
      </QueryClientProvider>
    </RealtimeProvider>
  </SystemFeedbackProvider>
);

export default PostsProviders;
