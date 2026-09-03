import groupListModule from '../groupListModule';
import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';

function groupsShowcaseGridController(groupsListConstants, groupsListService) {
  'ngInject';

  var ctrl = this;

  ctrl.loadMoreGroups = function () {
    if (ctrl.layout.canLoadMore) {
      loadFromCache();
      groupsListService.lazyImageRefresh();
    }
  };

  function loadFromCache() {
    if (ctrl.groupsCache) {
      var endRow = ctrl.layout.startRow + ctrl.layout.maxRows;
      var result = ctrl.groupsCache.slice(0, endRow);
      ctrl.layout.canLoadMore =
        result.length < ctrl.groupsCache.length && result.length % ctrl.layout.maxRows === 0;
      ctrl.layout.startRow = endRow;
      ctrl.groups = result;
    }
  }

  var init = function () {
    ctrl.layout = groupsListConstants.showcaseLayout;

    loadFromCache();
    groupsListService.lazyImageRefresh();

    initRobloxBadgesFrameworkAgnostic({
      overrideIconClass: 'verified-badge-icon-group-carousel'
    });
  };

  ctrl.$onInit = init;
  ctrl.$onChanges = init;
}

groupListModule.controller('groupsShowcaseGridController', groupsShowcaseGridController);
export default groupsShowcaseGridController;
