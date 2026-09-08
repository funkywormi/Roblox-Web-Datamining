import Roblox, { CurrentUser } from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { queryClient, TranslationProvider } from 'react-utilities';
import { Loading, SystemFeedbackProvider } from 'react-style-guide';
import { QueryClientProvider } from '@tanstack/react-query';
import { MIGRATION_STATUS, useGetMigrationStatus } from '@rbx/group-management';
import ConfigureGroupRolesContainerV1 from './containers/ConfigureGroupRolesContainer';
import ConfigureGroupRolesContainerV2 from './containers/ConfigureGroupRolesContainerV2';
import { groupsConfig } from '../shared/translation.config';
import '../../../css/tailwind.css';
import '../../../css/configureGroup.scss';
import { Group, GroupConfigurationMetadata } from '../shared/types';
import { ConfigurationMetadataProvider } from '../shared/contexts/ConfigurationMetadataContext';
import {
  CommunityProductFeaturesContextProvider,
  useCommunityProductFeatures
} from '../shared/contexts/CommunityProductFeaturesContext';

const ConfigureGroupRolesContainer = ({ group }: { group: Group }) => {
  const { features, isLoading: isFeaturesLoading } = useCommunityProductFeatures();
  const isUnifiedUIEnabled = features.IsUnifiedUIEnabled;

  const { data: migrationStatus, isLoading: isMigrationLoading } = useGetMigrationStatus(group.id, {
    enabled: isUnifiedUIEnabled === true
  });

  if (isFeaturesLoading || (isUnifiedUIEnabled === true && isMigrationLoading)) return <Loading />;

  return isUnifiedUIEnabled === true && migrationStatus?.status === MIGRATION_STATUS.MIGRATED ? (
    <ConfigureGroupRolesContainerV2 groupId={group.id} userId={Number(CurrentUser.userId)} />
  ) : (
    <ConfigureGroupRolesContainerV1 group={group} />
  );
};

const renderConfigureGroupRoles = (
  container: Element,
  initialData: {
    group: Group;
    metadata: GroupConfigurationMetadata;
    onReloadGroupFunds?: () => void;
  }
) => {
  unmountComponentAtNode(container);

  render(
    <SystemFeedbackProvider>
      <TranslationProvider config={groupsConfig}>
        <QueryClientProvider client={queryClient}>
          <ConfigurationMetadataProvider metadata={initialData.metadata}>
            <CommunityProductFeaturesContextProvider groupId={initialData.group.id}>
              <ConfigureGroupRolesContainer group={initialData.group} />
            </CommunityProductFeaturesContextProvider>
          </ConfigurationMetadataProvider>
        </QueryClientProvider>
      </TranslationProvider>
    </SystemFeedbackProvider>,
    container
  );
};

const ConfigureGroupRolesService = {
  renderConfigureGroupRoles
};

Object.assign(Roblox, {
  ConfigureGroupRolesService
});
