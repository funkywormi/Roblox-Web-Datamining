import groupSearchModule from '../groupSearchModule';

function groupLandingController($log, $filter, groupSearchService) {
  'ngInject';

  const ctrl = this;

  ctrl.loadGroupSearchMetadata = () => {
    groupSearchService.getGroupSearchMetadata().then(
      metadata => {
        ctrl.keywords = metadata.SuggestedGroupKeywords;
        ctrl.layout.isFriendsGroupsEnabled = metadata.ShowFriendsGroupsSort;
      },
      () => {
        ctrl.layout.loadGroupSearchMetadataError = true;
        $log.debug('--loadGroupSearchMetadata-error---');
      }
    );
  };

  const init = () => {
    ctrl.layout = {};
    ctrl.keywords = [];
    ctrl.loadGroupSearchMetadata();
  };

  ctrl.$onInit = init;
}

groupSearchModule.controller('groupLandingController', groupLandingController);

export default groupLandingController;
