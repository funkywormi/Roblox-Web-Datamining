import { authenticatedUser } from 'header-scripts';
import groupSearchModule from '../groupSearchModule';

function friendsGroupsController(
  $log,
  groupSearchService,
  groupSearchConstants,
  groupUtilityService
) {
  'ngInject';

  const ctrl = this;

  ctrl.loadFriendsGroups = () => {
    groupSearchService
      .getFriendsGroups(authenticatedUser.id)
      .then(
        result => {
          result.data.forEach(friendsGroupsResult => {
            const { user, groups } = friendsGroupsResult;
            user.url = groupUtilityService.profilePageUrl(user.userId);
            groups.forEach(({ group, role }) => {
              // Don't include groups you're already in
              if (ctrl.excludeGroupIds[group.id]) {
                return;
              }
              if (ctrl.groupsMap[group.id]) {
                ctrl.friendsListMap[group.id].push(user);
              } else {
                ctrl.groupsMap[group.id] = group;
                ctrl.friendsListMap[group.id] = [user];
              }
            });

            ctrl.sortedGroupIds = Object.keys(ctrl.friendsListMap).sort((a, b) => {
              const listA = ctrl.friendsListMap[a];
              const listB = ctrl.friendsListMap[b];
              if (listA.length < listB.length) {
                return 1;
              }
              if (listA.length > listB.length) {
                return -1;
              }

              return 0;
            });

            ctrl.groupIds = ctrl.sortedGroupIds.slice(0, ctrl.getDefaultRowSize());
          });
        },
        () => {
          ctrl.groupIds = [];
          $log.debug('--getGroups-error---');
        }
      )
      .finally(() => {
        ctrl.layout.isLoading = false;
      });
  };

  ctrl.toggleShowAll = () => {
    ctrl.showAll = !ctrl.showAll;
    if (ctrl.showAll) {
      ctrl.groupIds = ctrl.sortedGroupIds.slice(0, groupSearchConstants.friendsGroups.pageSize);
      ctrl.curPage = 1;
      ctrl.updatePageDisplay();
    } else {
      ctrl.groupIds = ctrl.sortedGroupIds.slice(0, ctrl.getDefaultRowSize());
    }
  };

  ctrl.getDefaultRowSize = () => {
    return ctrl.isV2
      ? groupSearchConstants.friendsGroups.pageSize
      : groupSearchConstants.friendsGroups.rowSize;
  };

  // Paging stuff. Not using a real pager since we have all the data
  ctrl.getPrevPage = () => {
    if (ctrl.curPage === 1) {
      return;
    }
    const startIndex = (ctrl.curPage - 2) * groupSearchConstants.friendsGroups.pageSize;
    ctrl.groupIds = ctrl.sortedGroupIds.slice(
      startIndex,
      startIndex + groupSearchConstants.friendsGroups.pageSize
    );
    ctrl.curPage -= 1;
    ctrl.updatePageDisplay();
  };

  ctrl.hasNextPage = () => {
    return ctrl.curPage * groupSearchConstants.friendsGroups.pageSize < ctrl.sortedGroupIds.length;
  };

  ctrl.getNextPage = () => {
    if (!ctrl.hasNextPage()) {
      return;
    }
    const startIndex = ctrl.curPage * groupSearchConstants.friendsGroups.pageSize;
    ctrl.groupIds = ctrl.sortedGroupIds.slice(
      startIndex,
      startIndex + groupSearchConstants.friendsGroups.pageSize
    );
    ctrl.curPage += 1;
    ctrl.updatePageDisplay();
  };

  ctrl.updatePageDisplay = () => {
    ctrl.displayedGroups = ctrl.groupIds.map(groupId => ctrl.groupsMap[groupId]);
  };

  const init = () => {
    ctrl.layout = {
      isLoading: true
    };
    ctrl.groupsMap = {};
    ctrl.friendsListMap = {};
    ctrl.excludeGroupIds = {};
    ctrl.sortedGroupIds = [];
    ctrl.displayedGroups = [];

    ctrl.myGroups.forEach(groupResult => {
      ctrl.excludeGroupIds[groupResult.group.id] = true;
    });

    // Load friends groups
    ctrl.loadFriendsGroups();
  };

  ctrl.$onInit = init;
}

groupSearchModule.controller('friendsGroupsController', friendsGroupsController);

export default friendsGroupsController;
