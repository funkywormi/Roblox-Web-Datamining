import { GroupsListService } from 'Roblox';
import groupListModule from '../groupListModule';

function groupReactGroupsList() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      currentGroup: '<',
      groupsList: '<',
      canCreateGroup: '<',
      isSidebar: '<',
      isLoadingGroups: '<',
      loadFailure: '<',
      showRanks: '<',
      showMemberCounts: '<',
      showButtonsOnTop: '<'
    },
    link(scope, element) {
      const renderGroupsList = () => {
        GroupsListService?.renderGroupsList(element[0], {
          currentGroup: scope.currentGroup,
          groupsList: scope.groupsList,
          canCreateGroup: scope.canCreateGroup,
          isSidebar: scope.isSidebar,
          isLoadingGroups: scope.isLoadingGroups,
          loadFailure: scope.loadFailure,
          showRanks: scope.showRanks,
          showMemberCounts: scope.showMemberCounts,
          showButtonsOnTop: scope.showButtonsOnTop
        });
      };

      element.ready(renderGroupsList);

      [
        'currentGroup',
        'groupsList',
        'canCreateGroup',
        'isSidebar',
        'isLoadingGroups',
        'loadFailure',
        'showRanks',
        'showMemberCounts',
        'showButtonsOnTop'
      ].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderGroupsList();
            }
          },
          true
        );
      });
    }
  };
}

groupListModule.directive('groupReactGroupsList', groupReactGroupsList);

export default groupReactGroupsList;
