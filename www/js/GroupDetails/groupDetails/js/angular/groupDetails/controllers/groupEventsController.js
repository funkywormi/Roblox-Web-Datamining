import groupModule from '../groupModule';

function groupEventsController($scope) {
  'ngInject';

  const ctrl = this;

  const init = function () {};

  ctrl.$onInit = init;
}

groupModule.controller('groupEventsController', groupEventsController);
export default groupEventsController;
