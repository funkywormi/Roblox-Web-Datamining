import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import CommunityLinkDisplay from './containers/CommunityLinkDisplay';
import '../../../css/gameCommunity/gameCommunity.scss';

const communityDetailsContainer = 'game-community-link-container';

ready(() => {
  const container = document.getElementById(communityDetailsContainer);
  if (container) {
    render(<CommunityLinkDisplay />, container);
  }
});
