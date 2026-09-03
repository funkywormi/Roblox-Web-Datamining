import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import { CacheProvider, createCache } from '@rbx/ui';
import { groupsConfig } from './translation.config';
import GroupVideosSection from './components/GroupVideosSection';
import { GroupVideosContextProps, GroupVideosContextProvider } from './context/GroupVideosContext';
import '../../../css/tailwind.css';
import '../../../css/groupVideos/groupVideos.scss';

const renderVideosSection = (container: Element, props: GroupVideosContextProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components

  const cache = createCache();
  render(
    <CacheProvider cache={cache}>
      <TranslationProvider config={groupsConfig}>
        <GroupVideosContextProvider {...props}>
          <GroupVideosSection />
        </GroupVideosContextProvider>
      </TranslationProvider>
    </CacheProvider>,
    container
  );
};

const GroupVideosService = {
  renderVideosSection
};

Object.assign(Roblox, {
  GroupVideosService
});
