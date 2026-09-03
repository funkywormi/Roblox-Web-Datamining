// import main module definition.
import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import PlayerBadgesContainer from '../playerBadges/containers/PlayerBadgesContainer';
import RobloxBadgesContainer from '../robloxBadges/containers/RobloxBadgesContainer';

import '../../../css/profileBadges/profileBadges.scss';

const robloxBadgesId = 'roblox-badges-container';
const playerBadgesId = 'player-badges-container';

ready(() => {
  if (document.getElementById(robloxBadgesId)) {
    render(<RobloxBadgesContainer />, document.getElementById(robloxBadgesId));
  }
  if (document.getElementById(playerBadgesId)) {
    render(<PlayerBadgesContainer />, document.getElementById(playerBadgesId));
  }
});
