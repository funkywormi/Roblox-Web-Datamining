import React from 'react';
import { Endpoints, EventStream } from 'Roblox';
import { prefetchAbuseUI } from '@rbx/abuse-report-ui';
import { authenticatedUser } from 'header-scripts';
import urlConstants from '../../../common/constants/urlConstants';
import ProfileDropdown from '../components/ProfileDropdown';
import constants from '../constants/profileHeaderConstants';
import authService from '../services/authService';
import friendsService from '../services/friendsService';
import useProfileHeaderContext from '../hooks/useProfileHeaderContext';
import { ActionType } from '../store/action';
import friendStatusEnums from '../enums/FriendStatus';
import useIsNewAbuseDialogEnabled from '../hooks/useIsNewAbuseDialogEnabled';

const ProfileDropdownContainer = ({
  profileUserId,
  translate
}: {
  profileUserId: number;
  translate: (key: string) => string;
}): JSX.Element => {
  const { state, dispatch } = useProfileHeaderContext();
  const { id } = authenticatedUser;
  const isMyProfile = profileUserId === id;
  const isAuthenticated = id !== -1;
  const loginUrl = Endpoints.getAbsoluteUrl('/login');
  const inventoryUrl = Endpoints.getAbsoluteUrl(`/users/${profileUserId}/inventory/`);
  const favoritesUrl = Endpoints.getAbsoluteUrl(`/users/${profileUserId}/favorites#!/places`);
  const homeUrl = Endpoints.getAbsoluteUrl('/home');
  // no api exists for this currently, still have to pull from the data attributes for now
  const mayImpersonate =
    document.querySelector('div[data-mayimpersonate]')?.getAttribute('data-mayimpersonate') ===
    'true';
  const isNewAbuseDialogEnabled = useIsNewAbuseDialogEnabled();

  const sendFollow = async () => {
    try {
      const follow = await friendsService.followUser(profileUserId);
      if (follow.success) {
        dispatch({ type: ActionType.UPDATE_FOLLOWERS_COUNT, amount: 1 });
        dispatch({ type: ActionType.UPDATE_FOLLOWING, following: true });
      }
    } catch (error) {
      dispatch({
        type: ActionType.SET_ERROR_MESSAGE,
        message: translate(constants.translationKeys.error.followFailed)
      });
    }
  };

  const unFollow = async () => {
    if (!id) {
      window.location.href = loginUrl;
    } else {
      try {
        await friendsService.unFollowUser(profileUserId);
        dispatch({ type: ActionType.UPDATE_FOLLOWERS_COUNT, amount: -1 });
        dispatch({ type: ActionType.UPDATE_FOLLOWING, following: false });
      } catch (error) {
        dispatch({
          type: ActionType.SET_ERROR_MESSAGE,
          message: translate(constants.translationKeys.error.unfollowFailed)
        });
      }
    }
  };

  const impersonateUser = async () => {
    try {
      await authService.impersonateUser(profileUserId);
      window.location.href = homeUrl;
    } catch (error) {
      dispatch({
        type: ActionType.SET_ERROR_MESSAGE,
        message: translate(constants.translationKeys.error.impersonateUserFailed)
      });
    }
  };

  const tradeItems = () => {
    EventStream.SendEventWithTarget(
      constants.eventNames.tradeEntryPoint,
      constants.eventCtx.profileMenu,
      {
        partnerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
    window.location.href = Endpoints.getAbsoluteUrl(`/users/${profileUserId}/trade`);
  };

  const handleDropdownWillOpen = () => {
    if (isNewAbuseDialogEnabled && !isMyProfile) {
      prefetchAbuseUI({ abuseVector: 'user_profile', targetIdStr: profileUserId.toString() });
    }
  };

  const buttons = [
    {
      id: 'customize-name-button',
      label: constants.translationKeys.customizeName,
      visible: state.friendStatus === friendStatusEnums.Friends,
      onClick: () => {
        dispatch({ type: ActionType.SHOW_ALIAS_EDIT_MODAL, show: true });
      }
    },
    {
      id: 'follow-button',
      label: constants.translationKeys.dropdown.follow,
      visible: !isMyProfile && !state.isFollowing && !state.isBlocked,
      onClick: sendFollow
    },
    {
      id: 'unfollow-button',
      label: constants.translationKeys.dropdown.unfollow,
      visible: !isMyProfile && state.isFollowing && !state.isBlocked,
      onClick: unFollow
    },
    {
      id: 'trade-button',
      label: constants.translationKeys.dropdown.tradeItems,
      visible: !state.isBlocked && state.canTradeWith,
      onClick: tradeItems
    },
    {
      id: 'block-button',
      label: !state.isBlocked
        ? constants.translationKeys.dropdown.blockUser
        : constants.translationKeys.dropdown.unblockUser,
      visible: !isMyProfile && isAuthenticated,
      onClick: () => {
        dispatch({ type: ActionType.SHOW_BLOCK_USER_MODAL, show: true });
      }
    },
    {
      id: 'inventory-button',
      label: constants.translationKeys.dropdown.inventory,
      visible: profileUserId !== 1,
      onClick: () => {
        window.location.href = inventoryUrl;
      }
    },
    {
      id: 'favorites-button',
      label: constants.translationKeys.dropdown.favorites,
      visible: state.hasFavorites,
      onClick: () => {
        window.location.href = favoritesUrl;
      }
    },
    {
      id: 'impersonate-button',
      label: constants.translationKeys.dropdown.impersonateUser,
      visible: mayImpersonate,
      onClick: impersonateUser
    },
    {
      id: 'report-abuse-button',
      label: constants.translationKeys.dropdown.reportAbuse,
      visible: !isMyProfile,
      onClick: () => {
        if (isNewAbuseDialogEnabled) {
          dispatch({ type: ActionType.SHOW_ABUSE_REPORT_DIALOG, show: true });
        } else {
          const abuseReportUrl = urlConstants.getAbuseReportRevampUrl({ profileUserId, state });
          window.location.href = abuseReportUrl;
        }
      }
    }
  ].filter(item => item.visible);

  return (
    <ProfileDropdown
      translate={translate}
      buttons={buttons}
      onDropdownWillOpen={handleDropdownWillOpen}
    />
  );
};

export default ProfileDropdownContainer;
