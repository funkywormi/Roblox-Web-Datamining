import groupSearchModule from '../groupSearchModule';

function groupLandingRowController($log, groupSearchService) {
  'ngInject';
  var ctrl = this;

  ctrl.loadGroups = function () {
    groupSearchService
      .getGroupsForKeyword(ctrl.keyword)
      .then(
        function (result) {
          ctrl.groups = result.data;
        },
        function () {
          ctrl.groups = [];
          $log.debug('--getGroupsForKeyword-error---');
        }
      )
      .finally(function () {
        ctrl.layout.isLoading = false;
      });
  };

  var init = function () {
    ctrl.showAll = false;
    ctrl.layout = {
      isLoading: true
    };

    ctrl.carouselId = 'group-landing-row-' + ctrl.rowIndex;

    ctrl.loadGroups();
  };

  ctrl.$onInit = init;
}

groupSearchModule.controller('groupLandingRowController', groupLandingRowController);

export default groupLandingRowController;
