import React, { useEffect } from 'react';
import { WithTranslationsProps, useTheme, withTranslations } from 'react-utilities';
import { urlService } from 'core-utilities';
import { entityUrl } from 'core-roblox-utilities';
import { authenticatedUser } from 'header-scripts';
import { useUserProfiles, UserProfileField } from 'roblox-user-profiles';
import Presence from 'roblox-presence';
import { UIThemeProvider } from '@rbx/ui';
import { AbuseReportDialog } from '@rbx/abuse-report-ui';
import profileHeaderConstants from '../constants/profileHeaderConstants';
import friendsService from '../services/friendsService';
import premiumFeaturesService from '../services/premiumFeaturesService';
import { translationConfig } from '../translation.config';
import AvatarHeadshot from '../components/AvatarHeadshot';
import ProfileNames from '../components/ProfileNames';
import SocialCount from '../components/SocialCount';
import usersService from '../services/usersService';
import gamesService from '../services/gamesService';
import FriendSubPages from '../enums/FriendSubPages';
import chatService from '../services/chatService';
import useProfileHeaderContext from '../hooks/useProfileHeaderContext';
import { ActionType } from '../store/action';
import BlockUserModal from '../components/BlockUserModal';
import EditAliasModal from '../components/EditAliasModal';
import SocialButtonsContainer from './SocialButtonsContainer';
import userBlockingService from '../services/userBlockingService';
import FriendStatus from '../enums/FriendStatus';
import {
  TCanTradeWithResponse,
  TFavoriteGamesResponse,
  TFollowingExistsResponse,
  TGetChatSettings,
  TGetCountResponse,
  TGetFriendStatusResponse,
  TGetProfileUserResponse,
  TGetWebProfileUIPolicyResponse
} from '../types/profileHeaderTypes';
import tradesServce from '../services/tradesServce';
import trackerClient, { ProfileEventType } from '../analytics/profileLogging';
import { getUrlUserId } from '../../../../js/utils/appUtil';
import universalAppConfigService from '../services/universalAppConfigService';
import {
  mustHideConnectionsDueToAMP,
  isBlockingViewer
} from '../../../../js/react/friends/util/osaUtil';
import TrustedFriendStatus from '../enums/TrustedFriendStatus';
import canAccessTCIndicatorViaAmp from '../../../../js/react/friends/util/tcIndicatorUtil';
import useIsNewAbuseDialogEnabled from '../hooks/useIsNewAbuseDialogEnabled';

const allSettled = (promises: Promise<any>[]) => {
  return Promise.all(
    promises.map(p =>
      p
        .then(
          (
            value:
              | TGetCountResponse
              | TGetCountResponse
              | TGetCountResponse
              | boolean
              | TGetProfileUserResponse
              | TGetFriendStatusResponse
              | { canMessage: boolean }
              | TGetChatSettings
              | TFollowingExistsResponse
              | { isFollowed: boolean; isFollowing: boolean }
              | TFavoriteGamesResponse
              | boolean
              | TCanTradeWithResponse
              | TGetWebProfileUIPolicyResponse
              | boolean
              | boolean
          ): { status: string; value: any } => ({
            status: 'fulfilled',
            value
          })
        )
        .catch((reason: string) => ({
          status: 'rejected',
          reason,
          value: null
        }))
    )
  );
};

const mustHideConnections = async (profileUserId: number, isMyProfile: boolean) => {
  if (isMyProfile) {
    return false;
  }
  if (await isBlockingViewer(profileUserId)) {
    return true;
  }
  const mustHide: boolean = await mustHideConnectionsDueToAMP(profileUserId);
  return mustHide;
};

const ProfileHeaderContainer = ({
  translate
}: {
  translate?: (key: string) => string;
} & WithTranslationsProps): JSX.Element => {
  const theme = useTheme();

  const { state, dispatch } = useProfileHeaderContext();
  const { id } = authenticatedUser;
  const profileNumberString: string = getUrlUserId() as string;
  const profileUserId: number = profileNumberString ? parseInt(profileNumberString, 10) : id;
  const isMyProfile = profileUserId === id;
  const isNewAbuseDialogEnabled = useIsNewAbuseDialogEnabled();

  const generateReferralLinkToExperience = (experienceId: number) => {
    return urlService.getUrlWithQueries(entityUrl.game.getReferralPath(), {
      PlaceId: experienceId,
      PageType: 'Profile',
      Position: 0
    });
  };

  const userProfileFields = [
    UserProfileField.Names.CombinedName,
    UserProfileField.Names.Username,
    UserProfileField.Names.DisplayName,
    UserProfileField.Names.Alias
  ];

  const { data } = useUserProfiles([profileUserId], userProfileFields);
  const presence = Presence.usePresence(profileUserId, undefined);

  /* eslint-disable */
  const getHeaderData: () => Promise<void> = async () => {
    const promises = [
      friendsService.getProfileFriendsCount(profileUserId),
      friendsService.getProfileFollowingsCount(profileUserId),
      friendsService.getProfileFollowersCount(profileUserId),
      premiumFeaturesService.getHasPremiumMembership(profileUserId),
      usersService.getProfileUser(profileUserId),
      friendsService.getFriendStatus(id, profileUserId),
      chatService.getChatSettings(),
      !isMyProfile
        ? friendsService.followingExists(profileUserId)
        : Promise.resolve({ isFollowed: false, isFollowing: false }),
      gamesService.getFavoriteGames(profileUserId),
      !isMyProfile && authenticatedUser.isAuthenticated
        ? userBlockingService.isBlockedUser(profileUserId)
        : Promise.resolve(false),
      tradesServce.canTradeWith(profileUserId),
      universalAppConfigService.getPolicies(),
      mustHideConnections(profileUserId, isMyProfile),
      friendsService.getTrustedConnectionStatus(profileUserId),
      canAccessTCIndicatorViaAmp()
    ];
    const [
      getFriendCount,
      getFollowingsCount,
      getFollowersCount,
      getPremiumMembership,
      getUser,
      friendStatus,
      getChatSettings,
      following,
      favoriteGames,
      isBlockedUser,
      canTradeWith,
      policies,
      mustNotLinkConnections,
      trustedConnectionStatus,
      canAccessTCIndicatorViaAmpStatus
    ] = await allSettled(promises);

    let isBlocked = isBlockedUser.status === 'fulfilled' ? isBlockedUser.value : true;

    let isFollowing = false;
    let isFollowed = false;
    if (following.status === 'fulfilled') {
      isFollowing = following.value.isFollowing;
      isFollowed = following.value.isFollowing;
    }

    dispatch({
      type: ActionType.SET_PROFILE_DATA,
      data: {
        hasVerifiedBadge: getUser.status === 'fulfilled' ? getUser.value.hasVerifiedBadge : false,
        friendCount: getFriendCount.status === 'fulfilled' ? getFriendCount.value.count : 0,
        followingsCount:
          getFollowingsCount.status === 'fulfilled' ? getFollowingsCount.value.count : 0,
        followersCount:
          getFollowersCount.status === 'fulfilled' ? getFollowersCount.value.count : 0,
        hasPremiumMembership:
          getPremiumMembership.status === 'fulfilled' ? getPremiumMembership.value : false,
        friendStatus:
          friendStatus.status === 'fulfilled' ? friendStatus.value.status : FriendStatus.NotFriends,
        canChat: getChatSettings.status === 'fulfilled' ? getChatSettings.value.chatEnabled : false,
        isFollowed,
        isFollowing,
        hasFavorites:
          favoriteGames.status === 'fulfilled' ? favoriteGames.value.data.length > 0 : false,
        isBlocked,
        canTradeWith: canTradeWith.status === 'fulfilled' ? canTradeWith.value.canTrade : false,
        policies: policies.status === 'fulfilled' ? policies.value : undefined,
        mustNotLinkConnections:
          mustNotLinkConnections.status === 'fulfilled' ? mustNotLinkConnections.value : true,
        trustedConnectionStatus:
          trustedConnectionStatus.status === 'fulfilled'
            ? trustedConnectionStatus.value.status
            : TrustedFriendStatus.NotFriends,
        canAccessTCIndicatorViaAmpStatus:
          canAccessTCIndicatorViaAmpStatus.status === 'fulfilled'
            ? canAccessTCIndicatorViaAmpStatus.value
            : false
      }
    });
  };

  const presenceUrl =
    presence.userPresenceType === Presence.PresenceType.Game && presence.rootPlaceId
      ? generateReferralLinkToExperience(presence.rootPlaceId)
      : undefined;

  const errorElement =
    state.errorMessage == null ? null : (
      <p className='text-error profile-header-error'>{state.errorMessage}</p>
    );

  useEffect(() => {
    trackerClient.sendEvent(ProfileEventType.PAGE_LOAD, 'profileHeader', profileUserId.toString());

    getHeaderData().catch(e => {
      throw e;
    });
  }, []);

  useEffect(() => {
    const names: {
      username?: string | null;
      combinedName?: string | null;
      displayName?: string | null;
      alias?: string | null;
    } = data ? data[profileUserId].names : {};
    dispatch({
      type: ActionType.SET_NAMES,
      names
    });
  }, [profileUserId, dispatch, data]);

  return (
    <UIThemeProvider theme={theme} cssBaselineMode='disabled'>
      <div className='profile-header-main'>
        <AvatarHeadshot
          profileUserId={profileUserId}
          presenceUrl={presenceUrl}
          trustedConnection={
            state.canAccessTCIndicatorViaAmpStatus &&
            state.trustedConnectionStatus === TrustedFriendStatus.TrustedFriends
          }
        />
        <div className='profile-header-details'>
          <ProfileNames profileUserId={profileUserId} />
          <ul className='profile-header-social-counts'>
            <SocialCount
              label={
                state.friendCount === 1
                  ? translate(profileHeaderConstants.translationKeys.connection)
                  : translate(profileHeaderConstants.translationKeys.connections)
              }
              count={state.friendCount}
              profileId={profileUserId}
              subPage={FriendSubPages.Friends}
              isClickable={!state.mustNotLinkConnections}
            />
            <SocialCount
              label={translate(profileHeaderConstants.translationKeys.followers)}
              count={state.followersCount}
              profileId={profileUserId}
              subPage={FriendSubPages.Followers}
              isClickable={!state.mustNotLinkConnections}
            />
            <SocialCount
              label={translate(profileHeaderConstants.translationKeys.following)}
              count={state.followingsCount}
              profileId={profileUserId}
              subPage={FriendSubPages.Following}
              isClickable={!state.mustNotLinkConnections}
            />
          </ul>
        </div>
        <SocialButtonsContainer id={id} profileUserId={profileUserId} translate={translate} />
      </div>
      {errorElement}
      <BlockUserModal profileUserId={profileUserId} translate={translate} />
      <EditAliasModal profileUserId={profileUserId} translate={translate} />
      {isNewAbuseDialogEnabled && (
        <AbuseReportDialog
          abuseVector='user_profile'
          targetIdStr={profileUserId.toString()}
          open={state.showAbuseReportDialog}
          onClose={() => {
            dispatch({ type: ActionType.SHOW_ABUSE_REPORT_DIALOG, show: false });
            // reporter might have blocked the user during the reporting flow
            userBlockingService.isBlockedUser(profileUserId).then(isBlocked => {
              dispatch({ type: ActionType.UPDATE_USER_BLOCK, block: isBlocked });
            });
          }}
        />
      )}
    </UIThemeProvider>
  );
};

ProfileHeaderContainer.defaultProps = {
  translate: undefined
};

export default withTranslations(ProfileHeaderContainer, translationConfig);
