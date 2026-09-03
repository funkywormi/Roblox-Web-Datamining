import groupsModule from '../groupsModule';
import communityLinkConstants from '../constants/communityLinkConstants';

function communityLinksService($q, httpService, groupsConstants, $filter) {
  'ngInject';

  return {
    getLinkedCommunity(groupId) {
      const config = {
        url: $filter('formatString')(communityLinkConstants.urls.getGroupCommunityInfoUrl, {
          groupId: groupId
        })
      };

      return httpService
        .httpGet(config, {})
        .then(result => {
          return result;
        })
        .catch(error => {});
    },
    getAnnouncement(groupId) {
      const config = {
        url: $filter('formatString')(communityLinkConstants.urls.getGroupAnnouncement, {
          groupId: groupId
        })
      };
      return httpService
        .httpGet(config, {})
        .then(result => {
          return result;
        })
        .catch(error => {});
    }
  };
}

groupsModule.factory('communityLinksService', communityLinksService);

export default communityLinksService;
