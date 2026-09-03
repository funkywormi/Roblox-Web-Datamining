import Roblox from 'Roblox';
import React from 'react';
import { render } from 'react-dom';
import { SystemFeedbackProvider } from 'react-style-guide';
import { TranslationProvider } from 'react-utilities';
import { groupsConfig } from '../shared/translation.config';
import ConfigureGroupInformationPage from './components/ConfigureGroupInformationPage';
import '../../../css/tailwind.css';
import '../../../css/configureGroup.scss';
import { Group, GroupConfigurationMetadata } from '../shared/types';

type ConfigureGroupInformationInitialData = {
  group: Group;
  metadata: GroupConfigurationMetadata;
};

const renderConfigureGroupInformation = (
  container: Element,
  initialData: ConfigureGroupInformationInitialData
) => {
  render(
    <SystemFeedbackProvider>
      <TranslationProvider config={groupsConfig}>
        <ConfigureGroupInformationPage group={initialData.group} metadata={initialData.metadata} />
      </TranslationProvider>
    </SystemFeedbackProvider>,
    container
  );
};

const ConfigureGroupService = {
  renderConfigureGroupInformation
};

Object.assign(Roblox, {
  ConfigureGroupService
});
