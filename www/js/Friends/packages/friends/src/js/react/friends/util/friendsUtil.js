import { RealTime, CurrentUser } from 'Roblox';
import { dataStores } from 'core-roblox-utilities';
import presence from 'roblox-presence';
import friendsConstants from '../constants/friendsConstants';
import eventsConstants from '../constants/eventsConstants';
import friendsService from '../services/friendsService';
import { mustHideConnectionsDueToAMP, isBlockingViewer } from './osaUtil';

const { userDataStore } = dataStores;
const { MAX_PER_PAGE, FRIENDTABS, SORT_ORDER, CACHE_CRITERIA } = friendsConstants;
const { TAB_EVENTS_MAP, FRIENDS_EVENT_TYPE } = eventsConstants;
const isGuest = !CurrentUser.isAuthenticated;

const buildCacheCriteria = (cacheCriteria = CACHE_CRITERIA) => {
  return { ...cacheCriteria, CACHE_CRITERIA };
};

const mustHideConnections = async (profileUserId, isMyProfile) => {
  if (isMyProfile) {
    return false;
  }
  if (await isBlockingViewer(profileUserId)) {
    return true;
  }
  return mustHideConnectionsDueToAMP(profileUserId);
};

const loadUserData = ({
  currentTab,
  profileUserId,
  currentCursor,
  useCache,
  refreshCache = false,
  fetchMutualFriends = false,
  isMyProfile = false,
  friendsNameFilter = null,
  queryChanged = false,
  isTrustedFilterEnabled = null
}) => {
  let userDataPromise = new Promise(() => ({ friendsData: [] }));
  // bind friends Data with GamePlayabilities
  const handleDataStore = ({ userData: friendsData, prevCursor: prev, nextCursor: next }) => {
    const universeIds = [];
    if (friendsData && friendsData.length > 0) {
      for (let i = 0; i < friendsData.length; i++) {
        const universeId = friendsData[i]?.presence?.universeId;
        if (universeId) {
          universeIds.push(universeId);
        }
      }
    }
    if (universeIds.length > 0) {
      return friendsService
        .getGamePlayabilities(universeIds)
        .then(result => {
          const { data } = result;
          const universeIdToPlayable = {};
          if (data && data.length) {
            for (let i = 0; i < data.length; i++) {
              const item = data[i];
              universeIdToPlayable[item.universeId] = item.isPlayable;
            }
          }
          friendsData.forEach(item => {
            if (item.presence) {
              /* eslint-disable no-param-reassign */
              item.presence.isPlayable = universeIdToPlayable[item.presence.universeId];
              /* eslint-enable no-param-reassign */
            }
          });
          return {
            friendsData,
            prev,
            next
          };
        })
        .catch(() => ({
          friendsData,
          prev,
          next
        }));
    }
    return {
      friendsData,
      prev,
      next
    };
  };

  const addPresenceInformation = async ({
    userData: friendsData,
    prevCursor: prev,
    nextCursor: next
  }) => {
    try {
      const userPresences = await presence
        .getPresenceProvider()
        .getPresences(friendsData.map(x => x.id));
      const userPresenceMap = new Map(userPresences.map(x => [x.userId, x]));
      const friendsDataWithPresence = friendsData.map(data => ({
        ...data,
        presence: userPresenceMap.get(data.id) ?? {}
      }));
      return { userData: friendsDataWithPresence, prevCursor: prev, nextCursor: next };
    } catch (error) {
      return { userData: friendsData, prevCursor: prev, nextCursor: next };
    }
  };

  const filterConnectionsData = async ({
    userData: friendsData,
    prevCursor: prev,
    nextCursor: next
  }) => {
    if (await mustHideConnections(profileUserId, isMyProfile)) {
      return { userData: [], prevCursor: null, nextCursor: null };
    }
    return { userData: friendsData, prevCursor: prev, nextCursor: next };
  };

  const cacheCriteria = buildCacheCriteria({ useCache, refreshCache });

  switch (currentTab) {
    case FRIENDTABS.FRIENDS:
      if (friendsNameFilter == null || friendsNameFilter === '') {
        const fetchFunction =
          isTrustedFilterEnabled === null || isTrustedFilterEnabled === false
            ? friendsService.getPaginatedFriends
            : friendsService.getPaginatedTrustedConnections;
        userDataPromise = fetchFunction(
          profileUserId,
          currentCursor === 0 || queryChanged ? '' : currentCursor,
          isMyProfile,
          queryChanged
        )
          .then(res => {
            return {
              userData: res.data.PageItems,
              prevCursor: res.data.PreviousCursor,
              nextCursor: res.data.NextCursor
            };
          })
          .then(filterConnectionsData)
          .then(addPresenceInformation)
          .then(handleDataStore);
      } else {
        userDataPromise = friendsService
          .getSearchedFriends(
            profileUserId,
            currentCursor === 0 || queryChanged ? '' : currentCursor,
            friendsNameFilter,
            queryChanged
          )
          .then(res => {
            return {
              userData: res.data.PageItems,
              prevCursor: res.data.PreviousCursor,
              nextCursor: res.data.NextCursor
            };
          })
          .then(filterConnectionsData)
          .then(addPresenceInformation)
          .then(handleDataStore);
      }
      break;
    case FRIENDTABS.FOLLOWERS:
      userDataPromise = userDataStore
        .getFollowers(
          {
            userId: profileUserId,
            cursor: currentCursor,
            sortOrder: SORT_ORDER.desc,
            limit: MAX_PER_PAGE,
            isGuest
          },
          cacheCriteria
        )
        .then(filterConnectionsData)
        .then(handleDataStore);
      break;
    case FRIENDTABS.FOLLOWING:
      userDataPromise = userDataStore
        .getFollowings(
          {
            userId: profileUserId,
            cursor: currentCursor,
            sortOrder: SORT_ORDER.desc,
            limit: MAX_PER_PAGE,
            isGuest
          },
          cacheCriteria
        )
        .then(filterConnectionsData)
        .then(handleDataStore);
      break;
    case FRIENDTABS.FRIENDREQUESTS:
      if (currentCursor === 0 || queryChanged) {
        friendsService.clearNewFriendRequests();
      }
      userDataPromise = userDataStore
        .getFriendsRequests(
          {
            userId: profileUserId,
            cursor: currentCursor,
            limit: MAX_PER_PAGE,
            fetchMutualFriends,
            isGuest
          },
          cacheCriteria
        )
        .then(handleDataStore);
      break;
    default:
      return userDataPromise.catch(console.debug);
  }
  return userDataPromise.catch(console.debug);
};

const subscribeToFriendsNotifications = (currentTab, handleRealTime) => {
  if (isGuest) {
    return () => {};
  }
  const handleRealTimeEvent = data => {
    if (data && data.Type) {
      if (TAB_EVENTS_MAP[currentTab].includes(data.Type)) {
        handleRealTime(data.Type);
      }
    }
  };

  const realTimeClient = RealTime.Factory.GetClient();
  realTimeClient.Subscribe(FRIENDS_EVENT_TYPE, handleRealTimeEvent);
  return () => {
    realTimeClient.Unsubscribe(FRIENDS_EVENT_TYPE, handleRealTimeEvent);
  };
};

export default {
  loadUserData,
  subscribeToFriendsNotifications
};
