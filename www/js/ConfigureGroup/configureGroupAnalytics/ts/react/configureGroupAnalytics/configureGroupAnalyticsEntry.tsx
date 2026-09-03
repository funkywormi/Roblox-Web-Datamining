import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import { SystemFeedbackProvider } from 'react-style-guide';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureGroupConfig } from '../shared/translation.config';
import defaultQueryClientConfig from '../shared/constants/reactQueryConstants';
import '../../../css/tailwind.css';
import '../../../css/configureGroup.scss';
import { Group, GroupConfigurationMetadata } from '../shared/types';
import { ConfigurationMetadataProvider } from '../shared/contexts/ConfigurationMetadataContext';
import { CommunityProductFeaturesContextProvider } from '../shared/contexts/CommunityProductFeaturesContext';
import ConfigureGroupAnalyticsSection from './components/ConfigureGroupAnalyticsSection';

const queryClient = new QueryClient(defaultQueryClientConfig);

const renderConfigureGroupAnalytics = (
  container: Element,
  initialData: {
    group: Group;
    metadata: GroupConfigurationMetadata;
  }
) => {
  unmountComponentAtNode(container);

  render(
    <SystemFeedbackProvider>
      <TranslationProvider config={configureGroupConfig}>
        <QueryClientProvider client={queryClient}>
          <CommunityProductFeaturesContextProvider groupId={initialData.group.id}>
            <ConfigurationMetadataProvider metadata={initialData.metadata}>
              <ConfigureGroupAnalyticsSection group={initialData.group} />
            </ConfigurationMetadataProvider>
          </CommunityProductFeaturesContextProvider>
        </QueryClientProvider>
      </TranslationProvider>
    </SystemFeedbackProvider>,
    container
  );
};

const ConfigureGroupAnalyticsService = {
  renderConfigureGroupAnalytics
};

Object.assign(Roblox, {
  ConfigureGroupAnalyticsService
});
