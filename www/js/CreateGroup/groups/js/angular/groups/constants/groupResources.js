import groupsModule from '../groupsModule';

const groupResources = {
  templates: {
    groupsListBaseTemplate: 'groups-list-base',
    groupsListTemplate: 'groups-list',
    groupAboutTemplate: 'group-about',
    groupBaseTemplate: 'group-base',
    groupGamesTemplate: 'group-games',
    GroupResultsBaseTemplate: 'group-results-base',
    groupTabTemplate: 'group-tab'
  },
  modals: {
    openedClass: 'modal-open-noscroll',
    exileUser: {
      templateUrl: 'exile-user-modal',
      controller: 'exileUserController'
    },
    banUser: {
      templateUrl: 'ban-user-modal',
      controller: 'banUserController'
    },
    leaveGroup: {
      templateUrl: 'leave-group-modal',
      controller: 'leaveGroupController'
    },
    changeOwner: {
      templateUrl: 'change-owner-modal',
      controller: 'changeOwnerModalController'
    },
    changeOwnerUpsell: {
      templateUrl: 'change-owner-upsell-modal',
      controller: 'changeOwnerUpsellModalController'
    },
    reportAbuse: {
      templateUrl: 'report-abuse-modal',
      controller: 'reportAbuseController'
    }
  }
};

groupsModule.constant('groupResources', groupResources);

export default groupResources;
