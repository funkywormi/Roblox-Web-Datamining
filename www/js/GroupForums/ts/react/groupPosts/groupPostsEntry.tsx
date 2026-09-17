import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { queryClient, TranslationProvider } from 'react-utilities';
import { SystemFeedbackProvider } from 'react-style-guide';
import { QueryClientProvider } from '@tanstack/react-query';
import GroupForumsConfigSection, {
  GroupForumsConfigSectionProps
} from '../groupForums/components/GroupForumsConfigSection';
import { groupsConfig as groupForumsConfig } from '../groupForums/translation.config';
import '../../../css/tailwind.css';
import '../../../css/groupForums/groupForums.scss';
import '../../../css/groupPosts/groupPosts.scss';
import GroupForumsDiscovery, {
  GroupForumsDiscoveryProps
} from '../groupForums/containers/GroupForumsDiscovery';
import { CommunityProductFeaturesContextProvider } from '../shared/contexts/CommunityProductFeaturesContext';
import GroupPosts, { GroupPostsProps } from './containers/GroupPosts';
import { groupPostsConfig } from './translation.config';

const renderGroupPosts = (container: Element, props: GroupPostsProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(
    <TranslationProvider config={groupPostsConfig}>
      <GroupPosts {...props} />
    </TranslationProvider>,
    container
  );
};

const renderGroupForumsDiscovery = (container: Element, props: GroupForumsDiscoveryProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(
    <TranslationProvider config={groupForumsConfig}>
      <GroupForumsDiscovery {...props} />
    </TranslationProvider>,
    container
  );
};

const renderGroupForumsConfigSection = (
  container: Element,
  props: GroupForumsConfigSectionProps
) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components

  render(
    <TranslationProvider config={groupForumsConfig}>
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
const unmountComponent = (container: Element) => {
  unmountComponentAtNode(container);
};

const GroupPostsService = {
  renderGroupPosts,
  unmountGroupPosts: unmountComponent
};

const GroupForumsService = {
  renderGroupForumsConfigSection,
  renderGroupForumsDiscovery,
  unmountGroupForums: unmountComponent
};

Object.assign(Roblox, {
  GroupPostsService,
  GroupForumsService
});
