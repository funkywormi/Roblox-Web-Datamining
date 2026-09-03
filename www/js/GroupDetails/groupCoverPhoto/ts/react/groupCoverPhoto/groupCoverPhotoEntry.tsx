import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { TranslationProvider } from 'react-utilities';
import { CacheProvider, createCache } from '@rbx/ui';
import { groupsConfig } from '../groupVideos/translation.config';
import GroupCoverPhoto, { GroupCoverPhotoProps } from './components/GroupCoverPhoto';
import '../../../css/tailwind.css';

const renderCoverPhotoSection = (container: Element, props: GroupCoverPhotoProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components

  // If no assetId is provided, don't render anything
  if (!props.coverPhotoData.coverPhotoId) {
    return;
  }

  const cache = createCache();
  render(
    <CacheProvider cache={cache}>
      <TranslationProvider config={groupsConfig}>
        <GroupCoverPhoto {...props} />
      </TranslationProvider>
    </CacheProvider>,
    container
  );
};

const GroupCoverPhotoService = {
  renderCoverPhoto: renderCoverPhotoSection // Keep the same interface as expected by the directive
};

Object.assign(Roblox, {
  GroupCoverPhotoService
});

export default GroupCoverPhotoService;
