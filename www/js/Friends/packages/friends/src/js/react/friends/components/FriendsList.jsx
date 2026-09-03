import React, { useContext, useMemo, useEffect } from 'react';
import { CurrentUser } from 'Roblox';
import PropTypes from 'prop-types';
import { AvatarCardList } from 'react-style-guide';
import { withTranslations } from 'react-utilities';
import { useUserProfiles, UserProfileField } from 'roblox-user-profiles';
import { usePlusStatus } from '@rbx/identity-badges';
import translationConfig from '../translation.config';
import appContainer from '../containers/appContainer';
import FriendsListHeader from './FriendsListHeader';
import FriendCard from './FriendCard';
import friendsService from '../services/friendsService';
import friendsConstants from '../constants/friendsConstants';
import { FriendsMetadataContext } from '../context/friendsMetadataContext';

const { FRIENDS_EMPTY } = friendsConstants;

function FriendsList({
  translate,
  currentTab,
  isMyProfile,
  tooltipMsg,
  title,
  acceptFriendRequest,
  declineFriendRequest,
  refreshFriendsList,
  setFriends,
  updateFilter
}) {
  const { paginatedFriends, friendRequestIdToUniverseSourceMap } = useContext(
    FriendsMetadataContext
  );

  const userProfileFields = [
    UserProfileField.Names.CombinedName,
    UserProfileField.Names.Username,
    UserProfileField.IsVerified,
    UserProfileField.IsDeleted
  ];
  const listOfUserIds = useMemo(() => paginatedFriends.map(user => user.id), [paginatedFriends]);

  const { data } = useUserProfiles(listOfUserIds, userProfileFields);
  // SUBS-5048: bulk-fetch Roblox Plus status for the visible friends.
  // The hook gates internally on the GUAC `web-plus-identity-badge`
  // bundle, so when the flag is off `plusStatusByUserId` stays empty.
  const { data: plusStatusByUserId } = usePlusStatus(listOfUserIds);

  const makeRequestThenRemoveFriendCard = friendRequestFunc => {
    const removeCard = friendRequestId => {
      setFriends(paginatedFriends.filter(req => req.id !== friendRequestId));
    };

    return friendRequestFunc(removeCard);
  };
  const acceptFriendRequestThenRemoveCard = makeRequestThenRemoveFriendCard(acceptFriendRequest);
  const declineFriendRequestThenRemoveCard = makeRequestThenRemoveFriendCard(declineFriendRequest);

  return (
    <div className='friends-content section'>
      <FriendsListHeader
        {...{
          title,
          tooltipMsg,
          currentTab,
          isMyProfile,
          refreshFriendsList,
          updateFilter
        }}
      />
      {paginatedFriends.length > 0 ? (
        <AvatarCardList data={paginatedFriends}>
          {(friend, position) => (
            <FriendCard
              key={position}
              currentTab={currentTab}
              isMyProfile={isMyProfile}
              refreshFriendsList={refreshFriendsList}
              position={position}
              id={friend.id}
              name={data?.[friend.id]?.names.username}
              displayName={data?.[friend.id]?.names.combinedName}
              verifiedBadgeData={{
                hasVerifiedBadge: data?.[friend.id]?.isVerified ?? false
              }}
              isRobloxPlus={plusStatusByUserId?.[friend.id] === true}
              isDeleted={data?.[friend.id]?.isDeleted ?? false}
              friendRequestSentFromInGame={friend?.friendRequest?.sourceUniverseId !== null}
              friendRequestSentFromQrCode={friend?.friendRequest?.originSourceType === 'QrCode'}
              friendRequestSentAt={friend?.friendRequest?.sentAt}
              sourceUniverse={
                friend?.id in friendRequestIdToUniverseSourceMap
                  ? friendRequestIdToUniverseSourceMap[friend.id]
                  : null
              }
              mutualFriends={friend?.mutualFriendsList || []}
              presence={friend.presence}
              unfollowFriend={friend.unfollowFriend}
              unfriend={friend.unfriend}
              followFriend={friend.followFriend}
              acceptFriendRequestThenRemoveCard={acceptFriendRequestThenRemoveCard}
              declineFriendRequestThenRemoveCard={declineFriendRequestThenRemoveCard}
            />
          )}
        </AvatarCardList>
      ) : (
        <div className='section-content-off'> {translate(FRIENDS_EMPTY)}</div>
      )}
    </div>
  );
}

FriendsList.defaultProps = {};

FriendsList.propTypes = {
  translate: PropTypes.func.isRequired,
  currentTab: PropTypes.string.isRequired,
  isMyProfile: PropTypes.bool.isRequired,
  tooltipMsg: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  acceptFriendRequest: PropTypes.func.isRequired,
  declineFriendRequest: PropTypes.func.isRequired,
  refreshFriendsList: PropTypes.func.isRequired,
  setFriends: PropTypes.func.isRequired,
  updateFilter: PropTypes.func.isRequired
};

export default withTranslations(appContainer(FriendsList), translationConfig);
