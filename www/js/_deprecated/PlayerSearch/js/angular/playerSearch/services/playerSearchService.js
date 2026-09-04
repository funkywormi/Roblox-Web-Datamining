import { CurrentUser } from 'Roblox';
import angular from 'angular';
import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import playerSearchConstants from '../constants/playerSearchConstants';
import playerSearchModule from '../playerSearchModule';
import groupsService from './groups-service';
import playerSearchServiceV2 from './player-search-service';
import presenceService from './presence-service';
import userRelationshipsService from './user-relationships-service';

function playerSearchService($log, $q, $filter, httpService, urlService, orderByFilter) {
  'ngInject';
  const unsafeInputText = 'unsafeInput';

  function isChatEntrypointEnabled() {
    return $q(function (resolve, reject) {
      const config = { url: playerSearchConstants.urls.chatMetadataUrl };
      return httpService.httpGet(config).then(
        function (data) {
          resolve(data.isChatUserMessagesEnabled);
        },
        function () {
          // If we fail to load the chat privacy setting, assumed the chat is not enabled.
          resolve(false);
        }
      );
    });
  }

  function getSearchResults(keyword, cursor) {
    return $q(async (resolve, reject) => {
      try {
        const response = await playerSearchServiceV2.searchUsers(keyword, cursor);
        getDataForResults(response).then(resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  // this function combines all the data that we need to get for the results
  function getDataForResults(dataObj) {
    const resultArr = dataObj.data;
    // add a sortOrder so we can keep the data order intact.
    resultArr.forEach((item, idx) => {
      item.sortOrder = idx;
    });
    // get the ids
    const userIds = resultArr.map(item => {
      return item.id;
    });
    const promises = [];
    if (CurrentUser.isAuthenticated) {
      promises.push(...getUserRelationshipAndPresence(userIds));
    }
    return $q.all(promises).then(function (allData) {
      // combine all the results into one object
      const resHash = {};
      angular.forEach(resultArr, function (item) {
        resHash[item.id] = item;
      });

      // we loop through all the data returned by promises,
      // which is a collection of objects with userIds.
      angular.forEach(allData, function (userData) {
        userData.map(function (dataObj) {
          // all of the endpoints used return a different name for the user id.
          const userId = dataObj.UserId || dataObj.userId || dataObj.id;
          return Object.assign(resHash[userId], dataObj);
        });
      });
      dataObj.processedResult = orderByFilter(
        Object.keys(resHash).map(key => resHash[key]),
        'sortOrder'
      );

      // bootstraps the verified badges component
      try {
        initRobloxBadgesFrameworkAgnostic({
          overrideIconClass: 'verified-badge-icon-player-search'
        });
      } catch (e) {
        // noop
      }

      return dataObj;
    });
  }

  function gamePlayabilityRequest(universeIds) {
    return $q(async (resolve, reject) => {
      try {
        resolve(await presenceService.multiGetGamePlayabilityStatuses(universeIds));
      } catch (e) {
        reject(e);
      }
    });
  }

  function getUserRelationshipAndPresence(userIds) {
    const userPresenceRequest = $q(async (resolve, reject) => {
      try {
        resolve(await presenceService.multiGetUserPresences(userIds));
      } catch (e) {
        reject(e);
      }
    });

    const followingExistsRequest = $q(async (resolve, reject) => {
      try {
        resolve(await userRelationshipsService.multiGetUserFollowings(userIds));
      } catch (e) {
        reject(e);
      }
    });

    const friendsStatusRequest = $q(async (resolve, reject) => {
      try {
        resolve(await userRelationshipsService.multiGetFriendshipStatuses(userIds));
      } catch (e) {
        reject(e);
      }
    });

    const primaryGroups = $q(async (resolve, reject) => {
      try {
        resolve(await groupsService.multiGetUserPrimaryGroups(userIds));
      } catch (e) {
        reject(e);
      }
    });

    return [primaryGroups, followingExistsRequest, userPresenceRequest, friendsStatusRequest];
  }

  function addFriend(targetId) {
    const config = {
      url: $filter('formatString')(playerSearchConstants.urls.requestFriendshipUrl, {
        targetId
      })
    };
    const params = {
      friendshipOriginSourceType: playerSearchConstants.playerSearchFriendshipOriginSourceType
    };
    return httpService.httpPost(config, params, true).then(
      function success(response) {
        return response.data;
      },
      function error(response) {
        return $q.reject(response);
      }
    );
  }

  function acceptFriend(targetId) {
    const config = {
      url: $filter('formatString')(playerSearchConstants.urls.acceptFriendRequestUrl, {
        targetId
      })
    };

    return httpService.httpPost(config);
  }

  return {
    getSearchResults,
    gamePlayabilityRequest,
    isChatEntrypointEnabled,
    addFriend,
    acceptFriend,
    unsafeInputText
  };
}

playerSearchModule.factory('playerSearchService', playerSearchService);

export default playerSearchService;
