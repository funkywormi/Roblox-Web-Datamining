import { EnvironmentUrls } from 'Roblox';
import configureGroupModule from '../../configureGroupModule';

function configureGroupMembersController(configureGroupConstants, groupsService, $log) {
  'ngInject';

  const ctrl = this;

  ctrl.activeTab = configureGroupConstants.memberTabs.members;

  ctrl.getCreatorHubGroupRolesUrl = function () {
    if (!ctrl.group || !ctrl.group.id) {
      return '#';
    }
    return `https://create.${EnvironmentUrls.domain}/dashboard/group/roles?groupId=${ctrl.group.id}&activeTab=GroupRolesTab`;
  };

  ctrl.showRequestsTab = function () {
    return (
      ctrl.group.permissions.groupMembershipPermissions.inviteMembers &&
      ctrl.group[configureGroupConstants.groupSettings.approvalRequired]
    );
  };

  ctrl.showBannedMembersTab = function () {
    return (
      ctrl.group.permissions.groupMembershipPermissions.banMembers && ctrl.policies.displayGroupBans
    );
  };

  ctrl.groupMembersTabs = () => {
    const tabs = {
      members: configureGroupConstants.memberTabs.members
    };

    if (ctrl.showBannedMembersTab()) {
      tabs.banned = configureGroupConstants.memberTabs.banned;
    }

    if (ctrl.showRequestsTab()) {
      tabs.requests = configureGroupConstants.memberTabs.requests;
    }

    return tabs;
  };

  ctrl.loadConfigureGroupPolicies = function () {
    if (ctrl.policies.length > 0) {
      return;
    }

    groupsService.getConfigureGroupRules().then(
      response => {
        ctrl.policies = response;
      },
      () => {
        $log.debug('--loadConfigureGroupPolicies-error---');
      }
    );
  };

  ctrl.numTabs = function () {
    return Object.keys(ctrl.groupMembersTabs()).length;
  };

  const init = function () {
    ctrl.policies = {};

    ctrl.loadConfigureGroupPolicies();
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupMembersController', configureGroupMembersController);

export default configureGroupMembersController;
