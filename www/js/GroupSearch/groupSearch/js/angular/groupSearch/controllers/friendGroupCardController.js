import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import groupSearchModule from '../groupSearchModule';

function friendGroupCardController($filter, thumbnailConstants, groupsConstants) {
  'ngInject';

  const ctrl = this;

  const init = function () {
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.url = $filter('seoUrl')(groupsConstants.urlBase, ctrl.group.id, ctrl.group.name);
    ctrl.layout = {
      maxNumberOfDisplayAvatars: ctrl.isV2 ? 3 : 4
    };

    // bootstraps the verified badges component
    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-friend-group-discover'
      });
    } catch (e) {
      // noop
    }
  };

  ctrl.$onInit = init;
}

groupSearchModule.controller('friendGroupCardController', friendGroupCardController);
export default friendGroupCardController;
