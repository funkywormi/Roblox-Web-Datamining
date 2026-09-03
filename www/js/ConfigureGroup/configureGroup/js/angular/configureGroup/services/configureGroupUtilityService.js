import { Endpoints } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

const regexGroupIdFromUrl = /\/(?:groups|communities)\/configure\?id=(\d+)/g;

function configureGroupUtilityService(configureGroupConstants, $filter, groupsConstants) {
  'ngInject';

  const permissionCategoryToggleUtility = {
    showPermissionType: {},
    nameOfOpen: configureGroupConstants.permissionTypeCollapseToggle.nameOfOpen,
    nameOfClose: configureGroupConstants.permissionTypeCollapseToggle.nameOfClose
  };

  return {
    permissionCategoryToggleUtility,

    parseGroupId(url) {
      const match = regexGroupIdFromUrl.exec(url);
      if (match && match.length > 1) {
        return Number(match[1]);
      }
      return null;
    },

    profilePageUrl(userId) {
      return Endpoints
        ? Endpoints.getAbsoluteUrl(`/users/${userId}/profile`)
        : `/users/${userId}/profile`;
    },

    groupDetailsPageUrl(groupId, name) {
      return $filter('seoUrl')(groupsConstants.urlBase, groupId, name);
    },

    getNameForDisplay(user) {
      if (!user) {
        return null;
      }
      const currentUser = user;
      const { displayName } = currentUser;
      currentUser.nameForDisplay = displayName;
      return currentUser;
    }
  };
}

configureGroupModule.factory('configureGroupUtilityService', configureGroupUtilityService);

export default configureGroupUtilityService;
