import configureGroupModule from '../configureGroupModule';

function groupBannerController($scope) {
  'ngInject';

  const ctrl = this;

  const init = function () {};

  ctrl.$onInit = init;
}

configureGroupModule.controller('groupBannerController', groupBannerController);
export default groupBannerController;
