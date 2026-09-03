import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { CurrentUser } from 'Roblox';
import { SimpleTabs, createModal } from 'react-style-guide';
import { withTranslations } from 'react-utilities';
import classNames from 'classnames';
import appContainer from './containers/appContainer';
import translationConfig from './translation.config';
import PaginatedFriends from './containers/PaginatedFriends';
import PageHeader from './components/PageHeader';
import friendsConstants from './constants/friendsConstants';
import friendsService from './services/friendsService';
import { FriendsMetadataContext } from './context/friendsMetadataContext';
import productExperimentationService from '../../../ts/common/services/productExperimentationService';
import FriendsExperimentationType from '../../../ts/common/enums/FriendsExperimentationType';
import FriendRecommendations from '../friendRecommendations/App';
import { fetchFeatureCheckResponseWithNamespace } from './services/accessManagementService';

const { FRIENDTABS, FRIENDS_ERROR, SORT_OPTIONS } = friendsConstants;
const { userId } = CurrentUser;
const [Modal, modalService] = createModal();

// initialize friendsService with userId
friendsService.setUserId(userId);

function App({
  translate,
  metadata: {
    isMyProfile,
    profileUserId,
    userName,
    displayName,
    isFriendsFilterBarEnabled,
    isFriendsPageSortExperimentEnabled,
    isSortFriendsInApiExperimentEnabled,
    shouldDisplayFriendRequestContext
  },
  setMetadata,
  errorType,
  clearError
}) {
  useEffect(() => {
    document.title = `${translate('Label.Friends')} - Roblox`;
  }, [translate]);

  let headerTitle;
  if (isMyProfile) {
    headerTitle = translate('Heading.MyFriends');
  } else {
    const headingKey = 'Heading.UsersFriends';
    headerTitle = translate(headingKey, { username: displayName });
  }
  const friendsErrorResource = FRIENDS_ERROR[errorType] || {};
  const [completedExperimentRequest, setCompletedExperimentRequest] = useState(false);

  const {
    setFriendsSort,
    setFilterBarEnabled,
    setShowJoinGameButtonInFriendCardDesktopOnly,
    showFriendRecs,
    setTrustedConnectionsAmpPolicyLoaded,
    setCanAccessTrustedConnections,
    isTcManagementHubEnabled,
    setIsTcManagementHubEnabled
  } = useContext(FriendsMetadataContext);

  useEffect(() => {
    friendsService.getMetadata(profileUserId).then(({ data }) => {
      setMetadata(data);
    });
  }, []);

  useEffect(() => {
    if (!isTcManagementHubEnabled) return;

    fetchFeatureCheckResponseWithNamespace(
      friendsConstants.AMP_FEATURE_NAMES.IsUserInTcEligibleCountry,
      null,
      null,
      friendsConstants.AMP_NAMESPACES.ConnectionGraphCore
    )
      .then(({ access }) => {
        const trustedConnectionsIsSupported = access === 'Granted';
        setCanAccessTrustedConnections(trustedConnectionsIsSupported);
        setTrustedConnectionsAmpPolicyLoaded(true);
      })
      .catch(() => {
        setCanAccessTrustedConnections(false);
      });
  }, [isTcManagementHubEnabled]);

  useEffect(() => {
    setFilterBarEnabled(isFriendsFilterBarEnabled);
  }, [isFriendsFilterBarEnabled]);

  useEffect(() => {
    productExperimentationService
      .getFriendsExperimentationValues([
        FriendsExperimentationType.JoinButtonFriendCard,
        FriendsExperimentationType.JoinButtonFriendCardDesktopOnly,
        FriendsExperimentationType.TcManagementHub
      ])
      .then(({ data }) => {
        setFriendsSort(SORT_OPTIONS.API);
        if (data?.[FriendsExperimentationType.JoinButtonFriendCardDesktopOnly]) {
          setShowJoinGameButtonInFriendCardDesktopOnly(
            data[FriendsExperimentationType.JoinButtonFriendCardDesktopOnly]
          );
        }
        if (data?.[FriendsExperimentationType.TcManagementHub]) {
          setIsTcManagementHubEnabled(true);
        }
      })
      .catch(() => {
        setFriendsSort(SORT_OPTIONS.ALPHABETICAL);
        setShowJoinGameButtonInFriendCardDesktopOnly(false);
      })
      .finally(() => {
        setCompletedExperimentRequest(true);
      });
  }, [isFriendsPageSortExperimentEnabled, isSortFriendsInApiExperimentEnabled]);

  useEffect(() => {
    if (errorType) {
      modalService.open().catch(() => {
        clearError();
      });
    }
  }, [errorType]);

  const tabsData = [
    {
      id: 'friends',
      path: '/friends',
      title: 'Label.Friends',
      name: FRIENDTABS.FRIENDS,
      tooltipMsg: 'Message.FriendsTabTooltip',
      isDefault: true,
      show: userId != null
    },
    {
      id: 'following',
      path: '/following',
      title: 'Label.Following',
      name: FRIENDTABS.FOLLOWING,
      tooltipMsg: 'Message.FollowingTabTooltip'
    },
    {
      id: 'followers',
      path: '/followers',
      title: 'Label.Followers',
      name: FRIENDTABS.FOLLOWERS,
      tooltipMsg: 'Message.FollowerTabTooltip'
    },
    {
      id: 'requests',
      path: '/friend-requests',
      title: 'Label.Requests',
      name: FRIENDTABS.FRIENDREQUESTS,
      tooltipMsg: 'Message.FriendsTabTooltip',
      show: isMyProfile
    }
  ];

  // don't load initial page until we have completed loading experiment configs
  let tabsView;
  if (completedExperimentRequest) {
    tabsView = tabsData.reduce(
      (view, { path, title, name, tooltipMsg, show = true, isDefault, id }) => {
        if (show) {
          view.push(
            <SimpleTabs.Tab
              id={id}
              key={name}
              path={path}
              title={translate(title)}
              className={classNames({ 'subtract-item': !isMyProfile, 'signed-out': !userId })}
              name={name}
              isDefault={isDefault}>
              <PaginatedFriends
                title={translate(title)}
                currentTab={name}
                tooltipMsg={translate(tooltipMsg)}
              />
            </SimpleTabs.Tab>
          );
        }
        return view;
      },
      []
    );
  } else {
    tabsView = null;
  }

  return (
    <div className='row page-content'>
      <PageHeader title={headerTitle} show />

      <Modal
        title={errorType && translate(friendsErrorResource.titleText)}
        body={errorType && translate(friendsErrorResource.bodyText)}
        neutralButtonText={errorType && translate(friendsErrorResource.neutralButtonText)}
        footerText={
          errorType && friendsErrorResource.footerText && translate(friendsErrorResource.footerText)
        }
      />

      {showFriendRecs && <FriendRecommendations />}

      <SimpleTabs type={SimpleTabs.types.Hash} hashType='hashbang' isScrollable>
        {tabsView}
      </SimpleTabs>
      <div id='react-captcha-container' />
    </div>
  );
}

App.defaultProps = {
  metadata: {},
  errorType: null
};

App.propTypes = {
  translate: PropTypes.func.isRequired,
  metadata: PropTypes.objectOf(PropTypes.any),
  setMetadata: PropTypes.func.isRequired,
  errorType: PropTypes.string,
  clearError: PropTypes.func.isRequired
};

export default withTranslations(appContainer(App), translationConfig);
