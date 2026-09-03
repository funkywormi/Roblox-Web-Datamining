import PropTypes from 'prop-types';
import React from 'react';
import { Endpoints } from 'Roblox';
import { concatTexts } from 'core-utilities';
import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from 'roblox-thumbnails';
import { Tooltip } from 'react-style-guide';
import ClassNames from 'classnames';
import friendService from '../services/friendService';
import friendsConstants from '../../friends/constants/friendsConstants';

const { useState } = React;

const { PLUS_SIGN, MUTUAL_FRIENDS_SHOW_COUNT } = friendsConstants;

function FriendRecommendationItem({
  userId,
  userName,
  displayName,
  pendingRequest,
  mutualFriends,
  setError,
  translate
}) {
  const [requestProcessed, setRequestProcessed] = useState(false);
  const hasMutualFriends = mutualFriends != null && mutualFriends.length > 0;

  function addFriend() {
    setError('');
    friendService.sendOrAcceptFriendRequest(userId, pendingRequest).then(
      () => setRequestProcessed(true),
      err => {
        if (err?.data?.errors[0]?.userFacingMessage) {
          setError(err.data.errors[0].userFacingMessage);
          return;
        }
        setError(translate('Label.MiscError'));
      }
    );
  }

  const getIcon = () => {
    if (requestProcessed) {
      return 'icon-sandglass';
    }
    if (pendingRequest) {
      return 'icon-acceptfriend';
    }
    return 'icon-addfriend';
  };

  const generateMutualFriendsListItems = mutualFriendsList => {
    const listItems = mutualFriendsList
      .slice(0, MUTUAL_FRIENDS_SHOW_COUNT)
      .map(mutualFriend => <li className='text-overflow'>{mutualFriend}</li>);

    if (mutualFriendsList.length > MUTUAL_FRIENDS_SHOW_COUNT) {
      const remainingCount = mutualFriendsList.length - MUTUAL_FRIENDS_SHOW_COUNT;
      const remainingCountMessage = translate('Message.More', {
        plusSign: PLUS_SIGN,
        remainingCount
      });
      listItems.push(<li className='text-overflow'>{remainingCountMessage}</li>);
    }

    return listItems;
  };

  const mutualFriendsContext = mutualFriendsList => {
    const children = generateMutualFriendsListItems(mutualFriendsList);
    return (
      <Tooltip id='mutual-friends-tooltip' placement='bottom' content={children}>
        <span className='text-overflow text-secondary mutual-friends-tooltip-label friend-recommendation-name'>
          {translate('Label.MutualFriend', { mutualFriendsCount: mutualFriends.length })}
        </span>
      </Tooltip>
    );
  };

  return (
    <div className='friend-recommendation-item'>
      <a
        href={Endpoints.getAbsoluteUrl(`/users/${userId}/profile`)}
        className='friend-recommendation-link'>
        <span className='avatar-container avatar-headshot text-link'>
          <Thumbnail2d
            type={ThumbnailTypes.avatarHeadshot}
            size={ThumbnailAvatarHeadshotSize.size96}
            targetId={userId}
            includeProfileFrame
            imgClassName='avatar-card-image'
          />
        </span>
        <div className='friend-recommendation-info'>
          <span className='text-overflow friend-name font-caption-header friend-recommendation-name'>
            {displayName}
          </span>
          <span className='text-overflow text-secondary friend-recommendation-name'>
            {
              // eslint-disable-next-line prefer-spread -- concatTexts.concat is a Roblox text util, not Array.concat
              concatTexts.concat(['', userName], concatTexts.connectors.at, false)
            }
          </span>
          {pendingRequest && requestProcessed ? (
            <span className='text-overflow text-secondary friend-recommendation-name'>
              {translate('Label.YouAreFriends')}
            </span>
          ) : (
            hasMutualFriends && mutualFriendsContext(mutualFriends)
          )}
        </div>
      </a>
      {!(pendingRequest && requestProcessed) && (
        <button
          type='button'
          className={ClassNames('btn-control-md full-size add-friend-button ', {
            disabled: requestProcessed
          })}
          onClick={() => addFriend(userId)}>
          <span className={getIcon()} />
        </button>
      )}
    </div>
  );
}

FriendRecommendationItem.defaultProps = {
  mutualFriends: []
};

FriendRecommendationItem.propTypes = {
  userId: PropTypes.number.isRequired,
  userName: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  pendingRequest: PropTypes.bool.isRequired,
  mutualFriends: PropTypes.arrayOf(PropTypes.string),
  setError: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired
};

export default FriendRecommendationItem;
