import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';
import friendsConstants from '../constants/friendsConstants';
import { getUrlUserId } from '../../../utils/appUtil';

const { FRIENDTABS } = friendsConstants;

const {
  getMetadataUrl,
  declineFriendUrlConfig,
  acceptFriendUrlConfig,
  declineAllFriendsUrlConfig,
  followFriendUrlConfig,
  unfollowFriendUrlConfig,
  unfriendUrlConfig,
  getAvatarHeadshotsUrl,
  gamePlayabilityConfig,
  getFriendsRequestCountUrl,
  getFollowersCountUrl,
  getFollowingsCountUrl,
  getGamesUrl,
  findFriendsConfig,
  findTrustedFriendsConfig,
  searchFriendsConfig,
  getFriendsCountConfig,
  clearNewFriendRequestsUrlConfig,
  getTrustedConnectionStatusUrl
} = urlConstants;

const BATCH_LIMIT = 50;
const TRUSTED_FRIENDS_COUNT_MAX_PAGES = 5;

const hasNextFriendsPageCursor = nextCursor => nextCursor != null && String(nextCursor).length > 0;

const getFriendsTypeName = value => {
  switch (value) {
    case FRIENDTABS.FRIENDREQUESTS:
      return 'FriendRequests';
    case FRIENDTABS.FOLLOWING:
      return 'Following';
    case FRIENDTABS.FOLLOWERS:
      return 'Followers';
    case FRIENDTABS.FRIENDS:
    default:
      return 'AllFriends';
  }
};

export default {
  userId: 0,

  getFriendsTypeName,

  setUserId(authUserId) {
    this.userId = getUrlUserId() || authUserId;
  },

  getMetadata(profileUserId) {
    const urlConfig = {
      url: getMetadataUrl(),
      retryable: true,
      withCredentials: true
    };
    const data = {
      targetUserId: profileUserId
    };
    return httpService.get(urlConfig, data);
  },

  acceptFriendRequest(targetUserId) {
    const urlConfig = acceptFriendUrlConfig(targetUserId);

    return httpService.post(urlConfig);
  },

  declineFriendRequest(targetUserId) {
    const urlConfig = declineFriendUrlConfig(targetUserId);
    return httpService.post(urlConfig, {});
  },

  declineAllFriendRequests() {
    const urlConfig = declineAllFriendsUrlConfig();
    return httpService.post(urlConfig, {});
  },

  follow(targetUserId, captchaData) {
    const urlConfig = followFriendUrlConfig(targetUserId);
    return httpService.post(urlConfig, captchaData, true);
  },

  unfollow(targetUserId) {
    const urlConfig = unfollowFriendUrlConfig(targetUserId);
    const data = {
      targetUserId
    };
    return httpService.post(urlConfig, data);
  },

  unfriend(targetUserId) {
    const urlConfig = unfriendUrlConfig(targetUserId);
    return httpService.post(urlConfig, {});
  },

  getAvatarHeadshots(userIds) {
    const urlConfig = {
      url: getAvatarHeadshotsUrl(),
      retryable: true,
      withCredentials: true
    };

    return httpService
      .buildBatchPromises(userIds, BATCH_LIMIT, urlConfig)
      .then(batchResponse => {
        if (batchResponse && batchResponse.length > 0) {
          return batchResponse.reduce((avatars, { data: { data } }) => {
            return [...avatars, ...data];
          }, []);
        }
        return [];
      })
      .catch(() => {
        return [];
      });
  },

  getGamePlayabilities(universeIds) {
    const urlConfig = gamePlayabilityConfig();
    return httpService.get(urlConfig, { universeIds });
  },

  getFriendsRequestCount() {
    const urlConfig = {
      url: getFriendsRequestCountUrl(),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },

  getFollowersCount(targetUserId) {
    const urlConfig = {
      url: getFollowersCountUrl(targetUserId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },

  getFollowingsCount(targetUserId) {
    const urlConfig = {
      url: getFollowingsCountUrl(targetUserId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },

  getGames(universeIds) {
    const urlConfig = {
      url: getGamesUrl(),
      retryable: true,
      withCredentials: true
    };
    const data = {
      universeIds
    };
    return httpService.get(urlConfig, data);
  },

  getPaginatedFriends(requestorUserId, cursor, isMyProfile, queryChanged) {
    const urlConfig = findFriendsConfig(requestorUserId, cursor, isMyProfile, queryChanged);

    return httpService.get(urlConfig);
  },

  getSearchedFriends(requestorUserId, cursor, query, queryChanged) {
    const urlConfig = searchFriendsConfig(requestorUserId, cursor, query, queryChanged);

    return httpService.get(urlConfig);
  },

  getFriendsCount(requestorUserId) {
    const urlConfig = getFriendsCountConfig(requestorUserId);

    return httpService.get(urlConfig);
  },
  clearNewFriendRequests() {
    const urlConfig = clearNewFriendRequestsUrlConfig();

    return httpService.delete(urlConfig, {});
  },

  getTrustedConnectionStatus(userId) {
    return httpService.get(getTrustedConnectionStatusUrl(userId));
  },

  getPaginatedTrustedConnections(requesterUserId, cursor, _, queryChanged) {
    const urlConfig = findTrustedFriendsConfig(requesterUserId, cursor, queryChanged);
    return httpService.get(urlConfig);
  }
};
