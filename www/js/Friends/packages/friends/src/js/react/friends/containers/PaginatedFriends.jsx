import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { deviceMeta as DeviceMeta } from 'header-scripts';
import PropTypes from 'prop-types';
import { Pagination, Loading } from 'react-style-guide';
import { EventStream } from 'Roblox';
import FriendsList from '../components/FriendsList';
import appContainer from './appContainer';
import friendsService from '../services/friendsService';
import friendsConstants from '../constants/friendsConstants';
import friendsUtil from '../util/friendsUtil';
import { FriendsMetadataContext } from '../context/friendsMetadataContext';

const { loadUserData, subscribeToFriendsNotifications } = friendsUtil;

const {
  START_PAGE,
  MAX_PER_PAGE,
  FRIENDTABS,
  SORT_OPTIONS,
  EVENTS,
  FRIENDS_REQUEST_LIST_CONTEXT,
  DEVICE_TYPES,
  FRIEND_FILTER_OPTIONS
} = friendsConstants;

function PaginatedFriends({
  currentTab,
  metadata: { profileUserId, isMyProfile, onlyShowContents },
  friends,
  setFriends,
  loadMoreFriends,
  tooltipMsg,
  title,
  enableTabLoader,
  disableTabLoader,
  tabLoader
}) {
  const [currentPage, setCurrentPage] = useState(START_PAGE);
  const [currentCursor, setCurrentCursor] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);

  const {
    friendsCount,
    setFriendsCount,
    friendsNameFilter,
    setFriendsNameFilter,
    friendsStatusFilter,
    setFriendsStatusFilter,
    friendsSort,
    paginatedFriends,
    setPaginatedFriends,
    setFriendRequestIdToUniverseSourceMap,
    isTrustedFilterEnabled,
    setIsTrustedFilterEnabled
  } = useContext(FriendsMetadataContext);

  const deviceMeta = DeviceMeta.getDeviceMeta();
  const isDesktop = deviceMeta?.isDesktop && deviceMeta?.deviceType === DEVICE_TYPES.computer;
  const delimiter = '%2c';

  useEffect(() => {
    if (currentTab !== FRIENDTABS.FRIENDREQUESTS || paginatedFriends.length === 0) {
      return;
    }

    // save results from friend requests response
    const universeIds = paginatedFriends
      .filter(x => x && x.friendRequest && x.friendRequest.sourceUniverseId)
      .map(x => x.friendRequest.sourceUniverseId);

    if (universeIds.length === 0) {
      return;
    }

    friendsService.getGames(universeIds).then(response => {
      // fill out the universe info on friend requests
      if (response?.data?.data) {
        const universes = response.data.data;
        const newMapping = paginatedFriends.reduce((results, friendRequest) => {
          if (friendRequest?.friendRequest?.sourceUniverseId) {
            const { sourceUniverseId } = friendRequest.friendRequest;
            const sourceUniverse = universes.find(u => u.id === sourceUniverseId);
            /* eslint-disable no-param-reassign */
            if (sourceUniverse) {
              results[friendRequest.id] = sourceUniverse;
            }
            /* eslint-enable no-param-reassign */
          }
          return results;
        }, {});

        setFriendRequestIdToUniverseSourceMap(newMapping);
      }
    });
  }, [paginatedFriends, currentTab]);

  if (currentTab === FRIENDTABS.FRIENDS) {
    if (friendsSort === SORT_OPTIONS.ALPHABETICAL) {
      friends.sort((a, b) => {
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase()) return -1;
        if (a.displayName.toLowerCase() > b.displayName.toLowerCase()) return 1;
        return 0;
      });
    } else if (friendsSort === SORT_OPTIONS.STATUS) {
      // Sort order: in-game, in-studio, online, then offline. Within statuses, sort alphabetically
      friends.sort((a, b) => {
        if (a.presence.userPresenceType === b.presence.userPresenceType) {
          if (a.displayName.toLowerCase() < b.displayName.toLowerCase()) return -1;
          if (a.displayName.toLowerCase() > b.displayName.toLowerCase()) return 1;
        }
        if (a.presence.userPresenceType === 2) return -1;
        if (b.presence.userPresenceType === 2) return 1; // Put in-game friends on top
        if (a.presence.userPresenceType < b.presence.userPresenceType) return 1;
        if (a.presence.userPresenceType > b.presence.userPresenceType) return -1;
        return 0;
      });
    }
  }

  const sendFriendRequestsAnalyticsEvent = (pageNumber, friendRequests) => {
    if (currentTab === FRIENDTABS.FRIENDREQUESTS) {
      const friendRequestsDisplayedCount = friendRequests.slice(
        (pageNumber - 1) * MAX_PER_PAGE,
        pageNumber * MAX_PER_PAGE
      ).length;
      const eventData = {
        currentUserId: parseInt(profileUserId, 10),
        pageNumber,
        numberOfFriendRequestsCurrentlyDisplayed: friendRequestsDisplayedCount
      };
      EventStream.SendEvent(
        EVENTS.FRIEND_REQUESTS_DISPLAYED,
        FRIENDS_REQUEST_LIST_CONTEXT,
        eventData
      );

      const requestingUserIdStr = friendRequests
        .map(requestObj => requestObj.friendRequest.senderId)
        .join(delimiter);
      const mutualFriendContextStr = friendRequests
        .map(requestObj =>
          requestObj.mutualFriendsList && requestObj.mutualFriendsList.length > 0 ? 'T' : 'F'
        )
        .join(delimiter);
      const gamesContextStr = friendRequests
        .map(requestObj =>
          requestObj.friendRequest && requestObj.friendRequest.sourceUniverseId ? 'T' : 'F'
        )
        .join(delimiter);
      const absPositionStr = Array.from(
        { length: friendRequests.length },
        (_, pos) => pos + 1
      ).join(delimiter);

      EventStream.SendEvent(EVENTS.FRIENDS_LANDING_PAGE_LOAD, 'friendsLanding', {
        target: 'www',
        requestingUserId: requestingUserIdStr,
        mutualFriendsContext: mutualFriendContextStr,
        gamesContext: gamesContextStr,
        absPosition: absPositionStr
      });
    }
  };

  const filteredPaginatedFriends = friends.slice(
    (currentPage - 1) * MAX_PER_PAGE,
    currentPage * MAX_PER_PAGE
  );

  useEffect(() => {
    if (JSON.stringify(paginatedFriends) !== JSON.stringify(filteredPaginatedFriends)) {
      setPaginatedFriends(filteredPaginatedFriends);
    }
  }, [friends, friendsNameFilter, friendsStatusFilter, friendsSort, currentPage]);
  // Needs to be after the sort above ^ for consistent equality.
  const [prevFriendsStr, setPrevFriendsStr] = useState(JSON.stringify(friends));

  // Note: friends api returns 200 data max regardless of limit.
  // we use pageCount to create local pagination.
  const pageCount = Math.max(Math.ceil(friends.length / MAX_PER_PAGE), 1);
  const showPagination =
    nextCursor || currentPage > START_PAGE || pageCount > 1 || friendsCount > MAX_PER_PAGE;

  const hasNextPage = !!nextCursor || currentPage < pageCount;

  if (currentPage > pageCount) {
    setCurrentPage(pageCount);
  }

  const handlePagination = newPage => {
    const loadNextCursor = newPage > currentPage && newPage >= pageCount && nextCursor;
    if (loadNextCursor) {
      setCurrentCursor(nextCursor || 0);
    }
    setCurrentPage(newPage);
    sendFriendRequestsAnalyticsEvent(newPage, friends);
  };

  const refreshFriendsList = () => {
    enableTabLoader();
    const handleRefreshData = ({ friendsData, next }) => {
      setFriends(friendsData);
      setNextCursor(next);
      disableTabLoader();
    };
    loadUserData({
      currentTab: FRIENDTABS.FRIENDS,
      profileUserId,
      useCache: false,
      refreshCache: true,
      isMyProfile,
      friendsNameFilter,
      isTrustedFilterEnabled
    }).then(friendsRes => {
      if (FRIENDTABS.FRIENDS === currentTab) {
        handleRefreshData(friendsRes);
      }
    });
    loadUserData({
      currentTab: FRIENDTABS.FRIENDREQUESTS,
      profileUserId,
      currentCursor,
      useCache: false,
      refreshCache: true,
      isMyProfile,
      friendsNameFilter
    }).then(friendsRes => {
      if (FRIENDTABS.FRIENDREQUESTS === currentTab) {
        handleRefreshData(friendsRes);
      }
    });
  };

  const updateFilter = useCallback(filterOption => {
    setFriends([]);
    setNextCursor(null);
    setCurrentCursor(0);
    setFriendsNameFilter(null);
    setIsTrustedFilterEnabled(filterOption === FRIEND_FILTER_OPTIONS.TRUSTED);
  }, []);

  useEffect(() => {
    enableTabLoader();

    // there is a shared state of friends between all the paginated friends.
    // when we switch tabs (re-render the component). We have to wipe this shared state.
    setFriends([]);
    setFriendsCount(0);
    setFriendsNameFilter(null);
    setFriendsStatusFilter(null);
  }, []);

  useEffect(() => {
    if (friendsNameFilter != null) {
      setCurrentPage(START_PAGE);
      setNextCursor(null);

      let isSubscribed = true;
      const handleUserData = ({ friendsData, next }) => {
        if (isSubscribed) {
          setFriends(friendsData);
          setNextCursor(next);
          disableTabLoader();

          sendFriendRequestsAnalyticsEvent(currentPage, friendsData);
        }
      };

      enableTabLoader();

      const unsubscribeRealTime = subscribeToFriendsNotifications(currentTab, refreshFriendsList);

      loadUserData({
        currentTab,
        profileUserId,
        currentCursor,
        useCache: false,
        isMyProfile,
        friendsNameFilter,
        queryChanged: true
      }).then(handleUserData);

      return () => {
        isSubscribed = false;
        unsubscribeRealTime();
      };
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendsNameFilter]);

  useEffect(() => {
    let isSubscribed = true;
    const handleUserData = ({ friendsData, next }) => {
      if (isSubscribed) {
        loadMoreFriends(friendsData);
        setNextCursor(next);
        disableTabLoader();

        sendFriendRequestsAnalyticsEvent(currentPage, friendsData);
      }
    };

    enableTabLoader();

    const unsubscribeRealTime = subscribeToFriendsNotifications(currentTab, refreshFriendsList);

    loadUserData({
      currentTab,
      profileUserId,
      currentCursor,
      useCache: false,
      isMyProfile,
      friendsNameFilter,
      isTrustedFilterEnabled
    }).then(handleUserData);

    return () => {
      isSubscribed = false;
      unsubscribeRealTime();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, currentCursor, profileUserId, isTrustedFilterEnabled]);

  // If the current cursor is blank (first page) and next cursor is not, setting the current cursor forces us to fetch the second page of data
  // This avoids a bug where users have to hit the pagination
  useEffect(() => {
    if (nextCursor && !currentCursor) {
      setCurrentCursor(nextCursor);
    }
  }, [nextCursor, currentCursor]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isSubscribed = true;
    const refreshFriendsCount = () => {
      const currFriendsStr = JSON.stringify(friends);
      if (prevFriendsStr === currFriendsStr) {
        return;
      }

      setPrevFriendsStr(currFriendsStr);

      switch (currentTab) {
        case FRIENDTABS.FRIENDS:
          friendsService.getFriendsCount(profileUserId).then(({ data: { count } }) => {
            if (isSubscribed) {
              setFriendsCount(count);
            }
          });
          break;
        case FRIENDTABS.FOLLOWING:
          friendsService.getFollowingsCount(profileUserId).then(({ data: { count } }) => {
            if (isSubscribed) {
              setFriendsCount(count);
            }
          });
          break;
        case FRIENDTABS.FOLLOWERS:
          friendsService.getFollowersCount(profileUserId).then(({ data: { count } }) => {
            if (isSubscribed) {
              setFriendsCount(count);
            }
          });
          break;
        case FRIENDTABS.FRIENDREQUESTS:
          if (isMyProfile) {
            friendsService.getFriendsRequestCount().then(({ data: { count } }) => {
              if (isSubscribed) {
                setFriendsCount(count);
                const eventData = {
                  currentUserId: parseInt(profileUserId, 10),
                  numberOfFriendRequests: count
                };
                EventStream.SendEvent(
                  EVENTS.TOTAL_FRIEND_REQUESTS_RETRIEVED,
                  FRIENDS_REQUEST_LIST_CONTEXT,
                  eventData
                );
              }
            });
          }
          break;
        default:
          break;
      }
    };
    refreshFriendsCount();
    return () => {
      isSubscribed = false;
    };
  }, [currentTab, friends]);

  const mutualFriendsExtraPaddingClassName = showPagination
    ? 'mutual-friends-extra-padding-with-pagination'
    : 'mutual-friends-extra-padding-without-pagination';

  return (
    <React.Fragment>
      <FriendsList
        {...{
          isMyProfile,
          tooltipMsg,
          title,
          currentTab,
          onlyShowContents,
          refreshFriendsList,
          updateFilter
        }}
      />
      {showPagination && (
        <Pagination current={currentPage} hasNext={hasNextPage} onChange={handlePagination} />
      )}
      {currentTab === FRIENDTABS.FRIENDREQUESTS && !isDesktop && (
        <div className={mutualFriendsExtraPaddingClassName} />
      )}
    </React.Fragment>
  );
}

PaginatedFriends.defaultProps = {
  friends: []
};

PaginatedFriends.propTypes = {
  friends: PropTypes.arrayOf(PropTypes.any),
  setFriends: PropTypes.func.isRequired,
  loadMoreFriends: PropTypes.func.isRequired,
  metadata: PropTypes.objectOf(PropTypes.any).isRequired,
  tooltipMsg: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  currentTab: PropTypes.string.isRequired,
  enableTabLoader: PropTypes.func.isRequired,
  disableTabLoader: PropTypes.func.isRequired,
  tabLoader: PropTypes.objectOf(PropTypes.any).isRequired
};

export default appContainer(PaginatedFriends);
