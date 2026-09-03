import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import groupListModule from '../groupListModule';

function groupsListController(
  $timeout,
  groupsListConstants,
  groupsConstants,
  groupsListService,
  groupEventLoggingService,
  eventConstants
) {
  'ngInject';

  const ctrl = this;

  ctrl.createGroupUrl = function () {
    return groupsConstants.absoluteUrls.createGroup;
  };

  ctrl.handleCreateGroupClick = () => {
    groupEventLoggingService.logGroupPageClickEvent({
      clickTargetType: 'createGroup',
      context: eventConstants.EventContext.GroupHomepage
    });
    window.location.href = ctrl.createGroupUrl();
  };

  ctrl.canCreateGroup = function () {
    return !ctrl.groupList || ctrl.groupList.length < ctrl.maxGroups;
  };

  ctrl.filterKeyword = () => {
    if (ctrl.groups && ctrl.keyword && ctrl.keyword.length > 0) {
      ctrl.filteredGroups = ctrl.groups.filter(group => {
        const nameFilter = ctrl.keyword.toLowerCase().trim();
        return group.name.toLowerCase().includes(nameFilter);
      });
    } else {
      ctrl.filteredGroups = ctrl.groups;
    }
    groupsListService.buildScrollbar(groupsListConstants.groupsListSelector);
  };

  const init = function () {
    ctrl.layout = groupsListConstants.layout;
    ctrl.primaryGroup = null;
    ctrl.keyword = '';

    if (ctrl.groupList) {
      const primaryIndex = ctrl.groupList.findIndex(group => group.isPrimary);
      if (primaryIndex >= 0) {
        ctrl.primaryGroup = ctrl.groupList[primaryIndex];
        ctrl.groups = ctrl.groupList.filter(group => !group.isPrimary);
      } else {
        ctrl.groups = ctrl.groupList;
      }

      ctrl.filteredGroups = ctrl.groups;

      $timeout(function () {
        groupsListService.buildScrollbar(groupsListConstants.groupsListSelector);
      });

      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-group-name-in-group-list'
      });
    }
  };

  ctrl.$onInit = init;
  ctrl.$onChanges = init;
}

groupListModule.controller('groupsListController', groupsListController);
export default groupsListController;
