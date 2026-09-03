import { Endpoints } from 'Roblox';
import groupsModule from '../groupsModule';

const regexGroups = /\/groups/g;
const regexGroupIdFromUrl = /\/(?:groups|communities|profiles)\/(\d+)\//g;

function groupUtilityService($filter, urlService, $location, groupsConstants) {
  'ngInject';

  return {
    redirectToCommunitiesIfNecessary() {
      const url = $location.absUrl();
      if (regexGroups.test(url)) {
        const communitiesUrl = url.replace(regexGroups, '/communities');

        window.history.replaceState(null, '', communitiesUrl);
      }
    },
    redirectToPage(url) {
      if (!url) return;
      window.history.replaceState(null, '', url);
    },
    setPageTitle(newTitle, document, addRobloxSuffix = true) {
      if (!document) return;
      const titleSelector = document.querySelector('title');
      if (!titleSelector) return;
      titleSelector.textContent = `${newTitle}${addRobloxSuffix ? ' - Roblox' : ''}`;
    },
    parseGroupId(url) {
      const match = regexGroupIdFromUrl.exec(url);
      if (match && match.length > 1) {
        return Number(match[1]);
      }
      return null;
    },

    buildGameReferralUrl(placeId) {
      return urlService.getAbsoluteUrl(`/games/${placeId}`);
    },

    profilePageUrl(userId) {
      return Endpoints
        ? Endpoints.getAbsoluteUrl(`/users/${userId}/profile`)
        : `/users/${userId}/profile`;
    },

    groupDetailsPageUrl(groupId, name) {
      return $filter('seoUrl')(groupsConstants.urlBase, groupId, name);
    }
  };
}

groupsModule.factory('groupUtilityService', groupUtilityService);
export default groupUtilityService;
