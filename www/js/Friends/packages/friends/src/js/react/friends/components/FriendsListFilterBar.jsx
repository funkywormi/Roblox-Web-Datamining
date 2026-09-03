import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-style-guide';
import { withTranslations } from 'react-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import translationConfig from '../translation.config';
import FriendsListSearchBar from './FriendsListSearchBar';
import appContainer from '../containers/appContainer';
import friendsConstants from '../constants/friendsConstants';
import { FriendsMetadataContext } from '../context/friendsMetadataContext';
import events from '../constants/friendsEventStreamConstants';

const { FILTER_STATUS_OPTIONS, FILTER_STATUS_OPTIONS_DEFAULT } = friendsConstants;

function FriendsListFilterBar({ translate }) {
  const {
    friendsStatusFilter,
    setFriendsNameFilter,
    setFriendsStatusFilter,
    setIsTrustedFilterEnabled
  } = useContext(FriendsMetadataContext);

  function handleSetFriendsNameFilter(query) {
    eventStreamService.sendEvent(events.filterFriendsByName, {
      query
    });
    setFriendsNameFilter(query);
    setIsTrustedFilterEnabled(false);
  }
  function handleSetFriendsStatusFilter(status) {
    eventStreamService.sendEvent(events.filterFriendsByStatus, {
      status
    });
    setFriendsStatusFilter(status);
  }
  return (
    <div className='friends-filter'>
      <FriendsListSearchBar handleSearchValueChange={handleSetFriendsNameFilter} />
    </div>
  );
}

FriendsListFilterBar.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(appContainer(FriendsListFilterBar), translationConfig);
