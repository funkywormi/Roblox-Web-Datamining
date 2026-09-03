import groupModule from '../groupModule';

function groupForumsController($scope) {
  'ngInject';

  const ctrl = this;

  const init = function () {};

  ctrl.$onInit = init;
}

groupModule.controller('groupForumsController', groupForumsController);
export default groupForumsController;
