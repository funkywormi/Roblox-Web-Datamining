import { BootstrapWidgets, DeviceMeta } from 'Roblox';
import profileAboutModule from '../profileAboutModule';

function profileDescriptionViewController($timeout) {
  'ngInject';

  const ctrl = this;

  function onDescriptionChange() {
    // adding a timeout here (1 cycle) to allow the description to load before
    // truncate and toggle content are called
    $timeout(function () {
      BootstrapWidgets.TruncateContent();
      BootstrapWidgets.ToggleContent();
    });
  }

  function init() {
    ctrl.inApp = DeviceMeta ? DeviceMeta().isInApp : false;
  }

  ctrl.$onInit = init;
  ctrl.$onChanges = onDescriptionChange;
}

profileAboutModule.controller('profileDescriptionViewController', profileDescriptionViewController);
export default profileDescriptionViewController;
