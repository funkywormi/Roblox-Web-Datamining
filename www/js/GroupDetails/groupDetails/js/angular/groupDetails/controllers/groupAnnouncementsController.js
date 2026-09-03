import groupModule from '../groupModule';

function groupAnnouncementsController($scope) {
  'ngInject';

  const ctrl = this;

  const init = function () {};

  ctrl.$onInit = init;
}

groupModule.controller('groupAnnouncementsController', groupAnnouncementsController);
export default groupAnnouncementsController;
