import { EnvironmentUrls } from 'Roblox';
import groupSearchModule from '../groupSearchModule';

const groupSearchConstants = {
  friendsGroups: {
    rowSize: 6,
    pageSize: 24
  },

  myGroups: {
    pageSize: 24
  },

  pager: {
    pageSize: 10,
    loadPageSize: 25
  },

  errorCodes: {
    default: 0,
    textFiltered: 2
  },

  urls: {
    getGroupSearchMetadata: `${EnvironmentUrls.groupsApi}/v1/groups/search/metadata`,
    groupSearch: `${EnvironmentUrls.groupsApi}/v1/groups/search`,
    getFriendsGroups: `${EnvironmentUrls.groupsApi}/v1/users/{userId}/friends/groups/roles`,
    getGroups: `${EnvironmentUrls.groupsApi}/v1/users/{userId}/groups/roles`
  }
};

groupSearchModule.constant('groupSearchConstants', groupSearchConstants);
export default groupSearchConstants;
