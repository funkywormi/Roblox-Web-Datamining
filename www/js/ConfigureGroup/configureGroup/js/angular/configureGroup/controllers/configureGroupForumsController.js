import configureGroupModule from '../configureGroupModule';

function configureGroupForumsController($scope) {
  'ngInject';

  const ctrl = this;

  const init = function () {};

  ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupForumsController', configureGroupForumsController);
export default configureGroupForumsController;
