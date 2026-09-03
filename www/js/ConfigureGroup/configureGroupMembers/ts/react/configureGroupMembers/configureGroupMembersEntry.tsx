import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { queryClient, TranslationProvider } from 'react-utilities';
import { SystemFeedbackProvider } from 'react-style-guide';
import { QueryClientProvider } from '@tanstack/react-query';
import ConfigureGroupMembersContainer from './containers/ConfigureGroupMembersContainer';
import { configureGroupConfig } from '../shared/translation.config';
import '../../../css/tailwind.css';
import '../../../css/configureGroup.scss';
import { Group, GroupPermissions } from '../shared/types';
import { ModerateDialogProvider } from '../shared/contexts/ModerateDialogContext';
import { ModerateUserPermissionsProvider } from '../shared/contexts/ModerateUserPermissionsContext';
import { CommunityProductFeaturesContextProvider } from '../shared/contexts/CommunityProductFeaturesContext';
import KickUserDialog from '../shared/components/dialogs/KickUserDialog';
import BanUserDialog from '../shared/components/dialogs/BanUserDialog';

const renderConfigureGroupMembers = (
  container: Element,
  initialData: {
    group: Group & { permissions: GroupPermissions };
    policies: Record<string, boolean>;
  }
) => {
  unmountComponentAtNode(container);

  const props = {
    group: initialData.group,
    policies: initialData.policies
  };

  render(
    <TranslationProvider config={configureGroupConfig}>
      <SystemFeedbackProvider>
        <QueryClientProvider client={queryClient}>
          <CommunityProductFeaturesContextProvider groupId={initialData.group.id}>
            <ModerateDialogProvider>
              <ModerateUserPermissionsProvider permissions={initialData.group.permissions}>
                <ConfigureGroupMembersContainer {...props} />
                <KickUserDialog />
                <BanUserDialog />
              </ModerateUserPermissionsProvider>
            </ModerateDialogProvider>
          </CommunityProductFeaturesContextProvider>
        </QueryClientProvider>
      </SystemFeedbackProvider>
    </TranslationProvider>,
    container
  );
};

const ConfigureGroupMembersService = {
  renderConfigureGroupMembers
};

Object.assign(Roblox, {
  ConfigureGroupMembersService
});
