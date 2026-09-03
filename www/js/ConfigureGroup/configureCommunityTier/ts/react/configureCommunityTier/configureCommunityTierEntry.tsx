import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import { SystemFeedbackProvider } from 'react-style-guide';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommunityTierPage from './components/CommunityTierPage';
import { configureGroupConfig } from '../shared/translation.config';
import defaultQueryClientConfig from '../shared/constants/reactQueryConstants';
import '../../../css/tailwind.css';
import '../../../css/configureGroup.scss';
import { Group } from '../shared/types';

const queryClient = new QueryClient(defaultQueryClientConfig);

const renderConfigureCommunityTier = (
  container: Element,
  initialData: {
    group: Group;
  }
) => {
  unmountComponentAtNode(container);

  render(
    <SystemFeedbackProvider>
      <TranslationProvider config={configureGroupConfig}>
        <QueryClientProvider client={queryClient}>
          <CommunityTierPage groupId={initialData.group.id} />
        </QueryClientProvider>
      </TranslationProvider>
    </SystemFeedbackProvider>,
    container
  );
};

const unmountConfigureCommunityTier = (container: Element) => {
  unmountComponentAtNode(container);
};

const ConfigureCommunityTierService = {
  renderConfigureCommunityTier,
  unmountConfigureCommunityTier
};

Object.assign(Roblox, {
  ConfigureCommunityTierService
});
