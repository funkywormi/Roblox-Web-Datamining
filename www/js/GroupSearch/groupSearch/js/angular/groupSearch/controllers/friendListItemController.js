import { DeviceMeta } from 'Roblox';
import groupSearchModule from '../groupSearchModule';

function friendListItemController(thumbnailConstants) {
  'ngInject';

  const ctrl = this;

  const init = function () {
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.urlTarget = DeviceMeta && DeviceMeta().isInApp ? '_self' : '_blank';
  };

  ctrl.$onInit = init;
}

groupSearchModule.controller('friendListItemController', friendListItemController);
export default friendListItemController;
