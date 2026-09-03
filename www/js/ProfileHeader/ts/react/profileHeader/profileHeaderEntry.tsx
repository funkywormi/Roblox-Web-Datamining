import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import { CacheProvider, createCache } from '@rbx/ui';
import profileHeaderConstants from './constants/profileHeaderConstants';
import ProfileHeaderContainer from './containers/ProfileHeaderContainer';
import { ProfileHeaderContextProvider } from './store/contextProvider';

import '../../../css/profileHeader/profileHeader.scss';
import '../../../css/aliases/aliases.scss';
import '../../../css/tailwind.css';

ready(() => {
  if (profileHeaderConstants.profileHeaderContainer()) {
    const cache = createCache();
    render(
      <CacheProvider cache={cache}>
        <ProfileHeaderContextProvider>
          <ProfileHeaderContainer />
        </ProfileHeaderContextProvider>
      </CacheProvider>,
      profileHeaderConstants.profileHeaderContainer()
    );
  }
});
