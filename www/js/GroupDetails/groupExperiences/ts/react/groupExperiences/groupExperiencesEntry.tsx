import Roblox from 'Roblox';
import React from 'react';
import { render } from 'react-dom';
import { SystemFeedbackProvider } from 'react-style-guide';
import { TranslationProvider } from 'react-utilities';
import { groupsConfig } from './translation.config';
import GroupExperiences, { GroupExperiencesProps } from './container/GroupExperiences';
import GroupPublicServers, { GroupPublicServersProps } from './container/GroupPublicServers';

import '../../../css/tailwind.css';
import '../../../css/groupExperiences/groupExperiences.scss';

const renderGroupExperiences = (container: Element, props: GroupExperiencesProps) => {
  render(
    <TranslationProvider config={groupsConfig}>
      <GroupExperiences {...props} />
    </TranslationProvider>,
    container
  );
};

const renderGroupPublicServers = (container: Element, props: GroupPublicServersProps) => {
  render(
    <SystemFeedbackProvider>
      <TranslationProvider config={groupsConfig}>
        <GroupPublicServers {...props} />
      </TranslationProvider>
    </SystemFeedbackProvider>,
    container
  );
};

const GroupExperiencesService = {
  renderGroupExperiences,
  renderGroupPublicServers
};

Object.assign(Roblox, {
  GroupExperiencesService
});
