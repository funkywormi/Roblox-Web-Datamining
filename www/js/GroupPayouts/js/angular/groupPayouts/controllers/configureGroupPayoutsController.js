import { EnvironmentUrls } from 'Roblox';
import groupPayoutsModule from '../groupPayoutsModule';

function configureGroupPayoutsController($window) {
  'ngInject';

  const ctrl = this;

  const init = function () {
    $window.location.href = `https://create.${EnvironmentUrls.domain}/dashboard/group/payouts?groupId=${ctrl.groupId}`;
  };

  ctrl.$onInit = init;
}

groupPayoutsModule.controller('configureGroupPayoutsController', configureGroupPayoutsController);
export default configureGroupPayoutsController;
