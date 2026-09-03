import configureGroupModule from '../configureGroupModule';

function configureGroupUserCardController($scope) {
  'ngInject';

  const ctrl = this;

  const init = function () {};

  ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupUserCardController', configureGroupUserCardController);
export default configureGroupUserCardController;
