import groupSearchModule from '../groupSearchModule';

function friendAvatarsRowController() {
  'ngInject';

  const ctrl = this;

  const init = function () {};

  ctrl.$onInit = init;
}

groupSearchModule.controller('friendAvatarsRowController', friendAvatarsRowController);
export default friendAvatarsRowController;
