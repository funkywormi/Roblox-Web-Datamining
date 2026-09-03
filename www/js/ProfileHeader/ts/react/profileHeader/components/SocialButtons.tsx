import React from 'react';
import { urlService } from 'core-utilities';
import { Button } from '@rbx/ui';
import FriendStatus from '../enums/FriendStatus';
import profileHeaderConstants from '../constants/profileHeaderConstants';
import useProfileHeaderContext from '../hooks/useProfileHeaderContext';
import ProfileDropdownContainer from '../containers/ProfileDropdownContainer';

const SocialButtons = ({
  profileUserId,
  isMyProfile,
  canBeFollowed,
  translate,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  startChat,
  launchGame
}: {
  profileUserId: number;
  isMyProfile: boolean;
  canBeFollowed: boolean;
  sendFriendRequest: () => void;
  acceptFriendRequest: () => void;
  removeFriend: () => void;
  startChat: () => void;
  launchGame: () => void;
  translate: (key: string) => string;
}): JSX.Element => {
  const { state } = useProfileHeaderContext();
  const friendsUrl = urlService.getAbsoluteUrl(`/users/${profileUserId}/friends#!`);

  let friendButton = null;
  if (!isMyProfile) {
    if (state.friendStatus === FriendStatus.RequestReceived) {
      friendButton = (
        <Button
          id='friend-button'
          color='secondary'
          size='medium'
          variant='outlined'
          data-target-user-id={profileUserId}
          data-friends-url={friendsUrl}
          onClick={acceptFriendRequest}>
          {translate(profileHeaderConstants.translationKeys.buttons.accept)}
        </Button>
      );
    } else if (state.friendStatus === FriendStatus.NotFriends) {
      friendButton = (
        <Button
          id='friend-button'
          color='secondary'
          size='medium'
          variant='outlined'
          onClick={sendFriendRequest}
          disabled={state.isBlocked}>
          {translate(profileHeaderConstants.translationKeys.buttons.addConnection)}
        </Button>
      );
    } else if (state.friendStatus === FriendStatus.RequestSent) {
      friendButton = (
        <Button id='friend-button' color='secondary' size='medium' variant='contained' disabled>
          {translate(profileHeaderConstants.translationKeys.buttons.pending)}
        </Button>
      );
    } else if (state.friendStatus === FriendStatus.Friends) {
      friendButton = (
        <Button
          id='unfriend-button'
          color='secondary'
          size='medium'
          variant='outlined'
          data-target-user-id={profileUserId}
          onClick={removeFriend}>
          {translate(profileHeaderConstants.translationKeys.buttons.removeConnection)}
        </Button>
      );
    }
  }

  const messageButton =
    !isMyProfile && state.canChat && state.friendStatus === FriendStatus.Friends ? (
      <Button
        id='chat-button'
        color='secondary'
        size='medium'
        variant='contained'
        onClick={startChat}>
        {translate(profileHeaderConstants.translationKeys.buttons.chat)}
      </Button>
    ) : null;

  const gameButton =
    canBeFollowed && state.friendStatus !== '' ? (
      <Button
        id='join-game-button'
        color='primaryBrand'
        size='medium'
        variant='contained'
        onClick={launchGame}>
        {translate(profileHeaderConstants.translationKeys.buttons.joinGame)}
      </Button>
    ) : null;

  return (
    <div className='profile-header-buttons'>
      {gameButton}
      {messageButton}
      {friendButton}
      <ProfileDropdownContainer translate={translate} profileUserId={profileUserId} />
    </div>
  );
};

export default SocialButtons;
