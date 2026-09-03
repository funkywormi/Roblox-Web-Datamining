import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import ConfigureGroupSettingsContainer from './containers/ConfigureGroupSettingsContainer';
import { groupsConfig } from '../shared/translation.config';
import '../../../css/tailwind.css';
import '../../../css/configureGroup.scss';
import { GroupConfigurationMetadata } from './services/groupSettingsService';
import { Group } from '../shared/types';

const renderConfigureGroupSettings = (
  container: Element,
  initialData: {
    group: Group;
    metadata: GroupConfigurationMetadata;
  }
) => {
  unmountComponentAtNode(container);

  const props = {
    group: initialData.group,
    metadata: initialData.metadata
  };

  render(
    <TranslationProvider config={groupsConfig}>
      <ConfigureGroupSettingsContainer {...props} />
    </TranslationProvider>,
    container
  );
};

const ConfigureGroupSettingsService = {
  renderConfigureGroupSettings
};

Object.assign(Roblox, {
  ConfigureGroupSettingsService
});
