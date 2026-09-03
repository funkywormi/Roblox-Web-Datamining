import groupListModule from '../groupListModule';

function groupsShowcaseSwitcher(groupsListConstants, groupsListService, thumbnailConstants) {
  'ngInject';
  return {
    restrict: 'A',
    scope: {
      groups: '='
    },
    templateUrl: groupsListConstants.templates.groupsShowcaseSwitcherTemplate,
    link: function link(scope, elem, attrs) {
      scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;
      scope.thumbnailOptions = {
        isLazyLoading: true
      };
      scope.curIdx = 0;
      groupsListService.lazyImageRefresh();

      scope.slideNext = function () {
        if (scope.curIdx + 1 < scope.groups.length) {
          scope.curIdx++;
        } else {
          scope.curIdx = 0;
        }
        groupsListService.lazyImageRefresh();
      };

      scope.slidePrev = function () {
        if (scope.curIdx > 0) {
          scope.curIdx--;
        } else {
          scope.curIdx = scope.groups.length - 1;
        }
        groupsListService.lazyImageRefresh();
      };

      scope.multipleItems = function () {
        if (scope.groups) {
          return scope.groups.length > 1;
        }
        return false;
      };

      //we want to preload the slides so the transitions can happen and image is loaded
      scope.shouldPreLoad = function (idx) {
        if (scope.groups) {
          var last = scope.groups.length - 1;
          return (
            scope.curIdx === idx || //check current
            (scope.curIdx - 1 >= 0 ? idx === scope.curIdx - 1 : idx === last) || //check prev
            (scope.curIdx + 1 <= last ? idx === scope.curIdx + 1 : idx === 0)
          ); //check next
        }

        return false;
      };

      scope.showVerifiedBadge = function (group) {
        return group && group.groupHasVerifiedBadge;
      };
    }
  };
}

groupListModule.directive('groupsShowcaseSwitcher', groupsShowcaseSwitcher);

export default groupsShowcaseSwitcher;
