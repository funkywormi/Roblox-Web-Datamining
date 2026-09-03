import groupSearchModule from '../groupSearchModule';

function groupSearchService($filter, httpService, groupSearchConstants, $q) {
  'ngInject';

  let friendsGroupsResponse;
  let groupSearchMetadataResponse;
  const groupSearchKeywordsResponses = {};

  return {
    getGroupSearchMetadata() {
      return $q((resolve, reject) => {
        if (groupSearchMetadataResponse) {
          resolve(groupSearchMetadataResponse);
          return;
        }
        const config = {
          url: groupSearchConstants.urls.getGroupSearchMetadata
        };

        httpService.httpGet(config, {}).then(result => {
          groupSearchMetadataResponse = result;
          resolve(result);
        }, reject);
      });
    },

    getGroupsForKeyword(keyword) {
      return $q((resolve, reject) => {
        if (groupSearchKeywordsResponses[keyword]) {
          resolve(groupSearchKeywordsResponses[keyword]);
          return;
        }
        const config = {
          url: groupSearchConstants.urls.groupSearch
        };

        const params = {
          keyword
        };

        httpService.httpGet(config, params).then(result => {
          groupSearchKeywordsResponses[keyword] = result;
          resolve(result);
        }, reject);
      });
    },

    getFriendsGroups(userId) {
      return $q((resolve, reject) => {
        if (friendsGroupsResponse) {
          resolve(friendsGroupsResponse);
          return;
        }
        const config = {
          url: $filter('formatString')(groupSearchConstants.urls.getFriendsGroups, { userId })
        };

        httpService.httpGet(config, {}).then(result => {
          friendsGroupsResponse = result;
          resolve(result);
        }, reject);
      });
    },

    getGroups(userId) {
      const config = {
        url: $filter('formatString')(groupSearchConstants.urls.getGroups, { userId })
      };

      return httpService.httpGet(config, {});
    }
  };
}

groupSearchModule.factory('groupSearchService', groupSearchService);

export default groupSearchService;
