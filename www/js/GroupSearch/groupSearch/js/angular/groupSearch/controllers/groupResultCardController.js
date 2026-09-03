import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import groupSearchModule from '../groupSearchModule';

function groupResultCardController($filter, thumbnailConstants, groupsConstants) {
  'ngInject';

  var ctrl = this;

  var init = function () {
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.url = $filter('seoUrl')(groupsConstants.urlBase, ctrl.group.id, ctrl.group.name);

    // bootstraps the verified badges component
    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-group-search'
      });
    } catch (e) {
      // noop
    }
  };

  ctrl.$onInit = init;
}

groupSearchModule.controller('groupResultCardController', groupResultCardController);

export default groupResultCardController;
