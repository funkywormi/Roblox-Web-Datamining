import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import groupsModule from '../groupsModule';

function groupCardController($filter, thumbnailConstants, groupsConstants) {
  'ngInject';

  var ctrl = this;

  var init = function () {
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.url = $filter('seoUrl')(groupsConstants.urlBase, ctrl.group.id, ctrl.group.name);

    // bootstraps the verified badges component
    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-group-discover'
      });
    } catch (e) {
      // noop
    }
  };

  ctrl.$onInit = init;
}

groupsModule.controller('groupCardController', groupCardController);
export default groupCardController;
