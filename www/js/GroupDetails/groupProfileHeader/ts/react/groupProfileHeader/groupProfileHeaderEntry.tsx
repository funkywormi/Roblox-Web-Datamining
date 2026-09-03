import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SystemFeedbackProvider } from 'react-style-guide';
import { TranslationProvider } from 'react-utilities';
import { CacheProvider, createCache } from '@rbx/ui';
import GroupProfileHeaderSection from './components/GroupProfileHeaderSection';
import {
  CommunityTiersDisclosureBannerWithProvider,
  CommunityTiersDisclosureBannerProps
} from './components/CommunityTiersDisclosureBanner';
import defaultQueryClientConfig from '../shared/constants/reactQueryConstants';
import {
  GroupProfileHeaderContextProvider,
  GroupProfileHeaderContextProps
} from './context/GroupProfileHeaderContext';
import { CommunityProductFeaturesContextProvider } from '../shared/contexts/CommunityProductFeaturesContext';
import '../../../css/tailwind.css';
import '../../../css/groupProfileHeader/groupProfileHeader.scss';
import { groupsConfig } from './translation.config';

const queryClient = new QueryClient(defaultQueryClientConfig);

const renderGroupProfileHeaderSection = (
  container: Element,
  props: GroupProfileHeaderContextProps
) => {
  const cache = createCache();
  render(
    <CacheProvider cache={cache}>
      <SystemFeedbackProvider>
        <TranslationProvider config={groupsConfig}>
          <QueryClientProvider client={queryClient}>
            <CommunityProductFeaturesContextProvider groupId={props.groupId}>
              <GroupProfileHeaderContextProvider {...props}>
                <GroupProfileHeaderSection />
              </GroupProfileHeaderContextProvider>
            </CommunityProductFeaturesContextProvider>
          </QueryClientProvider>
        </TranslationProvider>
      </SystemFeedbackProvider>
    </CacheProvider>,
    container
  );
};

const renderCommunityTiersDisclosureBanner = (
  container: Element,
  props: CommunityTiersDisclosureBannerProps
) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components

  if (!props.groupId) {
    return;
  }

  render(
    <TranslationProvider config={groupsConfig}>
      <QueryClientProvider client={queryClient}>
        <CommunityTiersDisclosureBannerWithProvider {...props} />
      </QueryClientProvider>
    </TranslationProvider>,
    container
  );
};

const GroupProfileHeaderService = {
  renderGroupProfileHeaderSection,
  renderCommunityTiersDisclosureBanner
};

Object.assign(Roblox, {
  GroupProfileHeaderService
});
