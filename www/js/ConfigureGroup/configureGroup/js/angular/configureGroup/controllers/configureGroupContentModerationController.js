import configureGroupModule from '../configureGroupModule';

function configureGroupContentModerationController($scope) {
  'ngInject';

  const ctrl = this;

  const init = function () {};

  ctrl.$onInit = init;
}

configureGroupModule.controller(
  'configureGroupContentModerationController',
  configureGroupContentModerationController
);
export default configureGroupContentModerationController;
