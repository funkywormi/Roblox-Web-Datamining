import { EnvironmentUrls } from 'Roblox';
import groupListModule from '../groupListModule';

const groupsListConstants = {
  templates: {
    groupsListBaseTemplate: 'groups-list-base',
    groupsShowcaseBaseTemplate: 'groups-showcase',
    groupsShowcaseCardTemplate: 'groups-showcase-card',
    groupsShowcaseSwitcherTemplate: 'groups-showcase-switcher'
  },

  urls: {
    groupsListUrl: `${EnvironmentUrls.groupsApi}/v1/users/{id}/groups/roles?includeLocked=true`,
    primaryGroupUrl: `${EnvironmentUrls.groupsApi}/v1/users/{id}/groups/primary/role`,
    getGroupPolicyInfo: `${EnvironmentUrls.groupsApi}/v1/groups/policies`
  },

  errorCodes: {
    getGroups: {
      3: 1 // Invalid user
    }
  },

  layout: {
    isLoading: false,
    loadFailure: false
  },

  showcaseLayout: {
    startRow: 0,
    maxRows: 12,
    isLoading: false,
    loadFailure: false
  },

  groupsListSelector: '#groups-list'
};

groupListModule.constant('groupsListConstants', groupsListConstants);

export default groupsListConstants;
