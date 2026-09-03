import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import { SystemFeedbackProvider } from 'react-style-guide';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GroupForums, { GroupForumsProps } from './containers/GroupForums';
import GroupForumsConfigSection, {
  GroupForumsConfigSectionProps
} from './components/GroupForumsConfigSection';
import { groupsConfig } from './translation.config';
import '../../../css/tailwind.css';
import '../../../css/groupForums/groupForums.scss';
import GroupForumsDiscovery, { GroupForumsDiscoveryProps } from './containers/GroupForumsDiscovery';
import { CommunityProductFeaturesContextProvider } from '../shared/contexts/CommunityProductFeaturesContext';

const renderGroupForums = (container: Element, props: GroupForumsProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(
    <TranslationProvider config={groupsConfig}>
      <GroupForums {...props} />
    </TranslationProvider>,
    container
  );
};

const renderGroupForumsDiscovery = (container: Element, props: GroupForumsDiscoveryProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(
    <TranslationProvider config={groupsConfig}>
      <GroupForumsDiscovery {...props} />
    </TranslationProvider>,
    container
  );
};

const queryClient = new QueryClient();

const renderGroupForumsConfigSection = (
  container: Element,
  props: GroupForumsConfigSectionProps
) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components

  render(
    <TranslationProvider config={groupsConfig}>
      <SystemFeedbackProvider>
        <QueryClientProvider client={queryClient}>
          <CommunityProductFeaturesContextProvider groupId={props.group.id}>
            <GroupForumsConfigSection {...props} />
          </CommunityProductFeaturesContextProvider>
        </QueryClientProvider>
      </SystemFeedbackProvider>
    </TranslationProvider>,
    container
  );
};

// The group/configure pages mount these React roots inside Angular `ng-if` regions. Angular removes
// the host element on tab/scope teardown without notifying React, so anything foundation-ui portals
// to <body> would be orphaned there.
const unmountGroupForums = (container: Element) => {
  unmountComponentAtNode(container);
};

const GroupForumsService = {
  renderGroupForums,
  renderGroupForumsConfigSection,
  renderGroupForumsDiscovery,
  unmountGroupForums
};

Object.assign(Roblox, {
  GroupForumsService
});
