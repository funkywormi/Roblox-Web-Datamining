import { CurrentUser } from 'Roblox';
import groupSearchModule from '../groupSearchModule';

function myGroupsController(groupSearchConstants) {
  'ngInject';

  const ctrl = this;

  ctrl.toggleShowAll = () => {
    ctrl.showAll = !ctrl.showAll;
    ctrl.displayedGroups = ctrl.sortedGroups.slice(0, groupSearchConstants.myGroups.pageSize);
    ctrl.curPage = 1;
  };

  // Paging stuff. Not using a real pager since we have all the data
  ctrl.getPrevPage = () => {
    if (ctrl.curPage === 1) {
      return;
    }

    const startIndex = (ctrl.curPage - 2) * groupSearchConstants.myGroups.pageSize;
    ctrl.displayedGroups = ctrl.sortedGroups.slice(
      startIndex,
      startIndex + groupSearchConstants.myGroups.pageSize
    );
    ctrl.curPage -= 1;
  };

  ctrl.hasNextPage = () => {
    return ctrl.curPage * groupSearchConstants.myGroups.pageSize < ctrl.sortedGroups.length;
  };

  ctrl.getNextPage = () => {
    if (!ctrl.hasNextPage()) {
      return;
    }
    const startIndex = ctrl.curPage * groupSearchConstants.myGroups.pageSize;
    ctrl.displayedGroups = ctrl.sortedGroups.slice(
      startIndex,
      startIndex + groupSearchConstants.myGroups.pageSize
    );
    ctrl.curPage += 1;
  };

  const init = function () {
    ctrl.layout = {
      isLoading: true
    };
    ctrl.curPage = 1;
    const currentUserId = Number(CurrentUser.userId);
    const isOwner = groupAndRole =>
      !!groupAndRole.group.owner &&
      String(groupAndRole.group.owner.userId) === String(currentUserId);

    // Match sorting from groupsListService
    // UWP App's browser does not support .toSorted(), or ...
    const myGroupsSorted = ctrl.myGroups.slice();
    myGroupsSorted.sort((a, b) => {
      if (a.isPrimaryGroup) {
        return -1;
      }
      if (b.isPrimaryGroup) {
        return 1;
      }

      if (isOwner(b) && isOwner(a)) {
        return a.group.name.localeCompare(b.group.name, { sensitivity: 'base' });
      }
      if (isOwner(a)) {
        return -1;
      }
      if (isOwner(b)) {
        return 1;
      }
      return a.group.name.localeCompare(b.group.name, { sensitivity: 'base' });
    });

    ctrl.sortedGroups = myGroupsSorted.map(groupAndRole => groupAndRole.group);
    ctrl.displayedGroups = ctrl.sortedGroups.slice(0, groupSearchConstants.myGroups.pageSize);
  };

  ctrl.$onInit = init;
}

groupSearchModule.controller('myGroupsController', myGroupsController);

export default myGroupsController;
