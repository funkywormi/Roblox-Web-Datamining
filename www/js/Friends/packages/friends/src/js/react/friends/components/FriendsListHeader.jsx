import { dataStores } from 'core-roblox-utilities';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, createModal } from 'react-style-guide';
import { withTranslations } from 'react-utilities';
import { Chip } from '@rbx/foundation-ui';
import translationConfig from '../translation.config';
import appContainer from '../containers/appContainer';
import friendsConstants from '../constants/friendsConstants';
import { FriendsMetadataContext } from '../context/friendsMetadataContext';
import FriendsListFilterBar from './FriendsListFilterBar';

const { FRIENDTABS, FRIEND_FILTER_OPTIONS } = friendsConstants;
const { maxFriendRequestNotificationCount } = dataStores.userDataStore;
const [Modal, modalService] = createModal();

const getEducationText = (canAccessTrustedConnections, translate) => {
  if (canAccessTrustedConnections) {
    return (
      <div className='education-text-container'>
        <span>{translate('Description.DoMoreWithTrustedFriends')}</span>
        &nbsp;
        <a
          className='learn-more-link'
          rel='noreferrer'
          target='_blank'
          href='https://en.help.roblox.com/hc/articles/46158344285204'>
          {translate('LinkText.LearnMore')}
        </a>
      </div>
    );
  }

  return (
    <div className='education-text-container'>
      <span>{translate('Description.TrustedFriendsUnavailable')}</span>
    </div>
  );
};
function FriendsListHeader({
  translate,
  title,
  currentTab,
  tooltipMsg,
  declineAllFriendRequests,
  refreshFriendsList,
  isMyProfile,
  updateFilter
}) {
  const {
    friendsCount,
    isTrustedFilterEnabled,
    canAccessTrustedConnections,
    trustedConnectionsAmpPolicyLoaded,
    isTcManagementHubEnabled
  } = useContext(FriendsMetadataContext);
  const showIgnoreBtn = currentTab === FRIENDTABS.FRIENDREQUESTS && friendsCount > 0;

  let friendsCountText = `(${friendsCount})`;
  if (friendsCount >= maxFriendRequestNotificationCount && currentTab !== FRIENDTABS.FRIENDS) {
    friendsCountText = `(${maxFriendRequestNotificationCount}+)`;
  }

  return (
    <div>
      <div className='container-header'>
        <div className='friends-subtitle'>
          <h2>
            {title} {friendsCountText}
          </h2>

          <Tooltip id='friendsTooltip' placement='bottom' content={tooltipMsg}>
            <span className='icon-moreinfo' />
          </Tooltip>
          {currentTab === FRIENDTABS.FRIENDS && !isTrustedFilterEnabled && <FriendsListFilterBar />}
        </div>
        {currentTab === FRIENDTABS.FRIENDS && isMyProfile && isTcManagementHubEnabled && (
          <React.Fragment>
            <div className='chip-filters-container'>
              <Chip
                text={translate('Label.All')}
                isChecked={!isTrustedFilterEnabled}
                onCheckedChange={() => {
                  updateFilter(FRIEND_FILTER_OPTIONS.ALL);
                }}
              />
              <Chip
                text={translate('TrustedConnection.Label.Trusted')}
                isChecked={isTrustedFilterEnabled}
                onCheckedChange={() => {
                  updateFilter(FRIEND_FILTER_OPTIONS.TRUSTED);
                }}
              />
            </div>
            {isTrustedFilterEnabled &&
              trustedConnectionsAmpPolicyLoaded &&
              getEducationText(canAccessTrustedConnections, translate)}
          </React.Fragment>
        )}
        {showIgnoreBtn && (
          <Button
            variant='control'
            size='xs'
            className='ignore-button see-all-link'
            onClick={() =>
              declineAllFriendRequests().then(backgrounded => {
                if (backgrounded) {
                  modalService.open();
                } else {
                  refreshFriendsList();
                }
              })
            }>
            {translate('Action.IgnoreAll')}
          </Button>
        )}

        <Modal
          title={translate('Action.IgnoreAll')}
          body={translate('Label.DeclineAllBackgrounded')}
          neutralButtonText={translate('Label.Ok')}
        />
      </div>
    </div>
  );
}

FriendsListHeader.propTypes = {
  translate: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  currentTab: PropTypes.string.isRequired,
  tooltipMsg: PropTypes.string.isRequired,
  declineAllFriendRequests: PropTypes.func.isRequired,
  refreshFriendsList: PropTypes.func.isRequired,
  isMyProfile: PropTypes.bool.isRequired,
  updateFilter: PropTypes.func.isRequired
};

export default withTranslations(appContainer(FriendsListHeader), translationConfig);
