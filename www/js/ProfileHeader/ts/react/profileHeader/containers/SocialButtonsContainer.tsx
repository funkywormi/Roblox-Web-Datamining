import React from 'react';
import {
  DeviceMeta,
  Endpoints,
  EventStream,
  GameLauncher,
  ProtocolHandlerClientInterface
} from 'Roblox';
import { chatService } from 'core-roblox-utilities';
import Presence from 'roblox-presence';
import profileHeaderConstants from '../constants/profileHeaderConstants';
import FriendStatus from '../enums/FriendStatus';
import useProfileHeaderContext from '../hooks/useProfileHeaderContext';
import friendsService from '../services/friendsService';
import { ActionType } from '../store/action';
import SocialButtons from '../components/SocialButtons';

const SocialButtonsContainer = ({
  id,
  profileUserId,
  translate
}: {
  id: number;
  profileUserId: number;
  translate: (key: string) => string;
}): JSX.Element => {
  const { dispatch } = useProfileHeaderContext();
  const presence = Presence.usePresence(profileUserId, undefined);
  const loginUrl = Endpoints.getAbsoluteUrl('/login');

  const isMyProfile = profileUserId === id;
  const canBeFollowed =
    !isMyProfile &&
    presence.userPresenceType === Presence.PresenceType.Game &&
    presence.rootPlaceId != null;

  const firePlayerFriendAddEvent = () => {
    EventStream.SendEventWithTarget(
      profileHeaderConstants.eventNames.playerFriendAdd,
      profileHeaderConstants.eventCtx.userProfile,
      {
        uid: id.toString(),
        playerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
  };

  const firePlayerFriendAcceptEvent = () => {
    EventStream.SendEventWithTarget(
      profileHeaderConstants.eventNames.playerFriendAccept,
      profileHeaderConstants.eventCtx.userProfile,
      {
        uid: id.toString(),
        playerId: profileUserId.toString()
      },
      EventStream.TargetTypes.WWW
    );
  };

  const sendFriendRequest = async () => {
    if (!id) {
      window.location.href = loginUrl;
    } else {
      try {
        const response = await friendsService.sendFriendRequest(profileUserId);
        if (response.success === true) {
          firePlayerFriendAddEvent();
          dispatch({ type: ActionType.SET_FRIEND_STATUS, status: FriendStatus.RequestSent });
        } else {
          dispatch({
            type: ActionType.SET_ERROR_MESSAGE,
            message: translate(
              profileHeaderConstants.translationKeys.error.sendConnectionRequestFailed
            )
          });
        }
      } catch {
        dispatch({
          type: ActionType.SET_ERROR_MESSAGE,
          message: translate(
            profileHeaderConstants.translationKeys.error.sendConnectionRequestFailed
          )
        });
      }
    }
  };

  const acceptFriendRequest = async () => {
    if (!id) {
      window.location.href = loginUrl;
    } else {
      try {
        await friendsService.acceptFriendRequest(profileUserId);
        firePlayerFriendAcceptEvent();
        dispatch({ type: ActionType.SET_FRIEND_STATUS, status: FriendStatus.Friends });
        dispatch({ type: ActionType.UPDATE_FRIEND_COUNT, amount: 1 });
      } catch {
        dispatch({
          type: ActionType.SET_ERROR_MESSAGE,
          message: translate(profileHeaderConstants.translationKeys.error.acceptFriendRequestFailed)
        });
      }
    }
  };

  const removeFriend = async () => {
    if (!id) {
      window.location.href = loginUrl;
    } else {
      try {
        await friendsService.removeFriend(profileUserId);
        dispatch({ type: ActionType.SET_FRIEND_STATUS, status: FriendStatus.NotFriends });
        dispatch({ type: ActionType.UPDATE_FRIEND_COUNT, amount: -1 });
      } catch {
        dispatch({
          type: ActionType.SET_ERROR_MESSAGE,
          message: translate(profileHeaderConstants.translationKeys.error.removeFriendFailed)
        });
      }
    }
  };

  const launchGame = async () => {
    const joinAttemptId = presence.gameId || '';
    if (DeviceMeta().isInApp) {
      if (DeviceMeta().isDesktop) {
        GameLauncher.followPlayerIntoGame(profileUserId, joinAttemptId, 'JoinUser');
      } else {
        window.location.href = `/games/start?userID=${profileUserId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
      }
    } else if (DeviceMeta().isAndroidDevice || DeviceMeta().isChromeOs) {
      window.location.href = `intent://userId=${profileUserId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser#Intent;scheme=robloxmobile;package=com.roblox.client;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.roblox.client;end`;
    } else if (DeviceMeta().isIosDevice) {
      window.location.href = `robloxmobile://userId=${profileUserId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
    } else {
      await ProtocolHandlerClientInterface.followPlayerIntoGame({
        userId: profileUserId,
        joinAttemptId,
        joinAttemptOrigin: 'JoinUser'
      });
    }
  };

  const startChat = () => {
    chatService.startDesktopAndMobileWebChat({ userId: profileUserId });
  };

  return (
    <SocialButtons
      profileUserId={profileUserId}
      isMyProfile={isMyProfile}
      canBeFollowed={canBeFollowed}
      sendFriendRequest={sendFriendRequest}
      acceptFriendRequest={acceptFriendRequest}
      removeFriend={removeFriend}
      startChat={startChat}
      launchGame={launchGame}
      translate={translate}
    />
  );
};

export default SocialButtonsContainer;
