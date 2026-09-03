import groupSearchModule from '../groupSearchModule';

function groupResultsController($scope) {
  'ngInject';

  var ctrl = this;

  var init = function () {
    // Needed for cursorPagingDirective to find the pager
    $scope.pager = ctrl.pager;
    ctrl.useCustomPager = ctrl.getPrevPage != null && ctrl.getNextPage != null;
    ctrl.showFriends = ctrl.friendsListMap != null;
    ctrl.showHeader = !!ctrl.keyword && !ctrl.hideHeader;
  };

  ctrl.$onInit = init;
}

groupSearchModule.controller('groupResultsController', groupResultsController);

export default groupResultsController;
