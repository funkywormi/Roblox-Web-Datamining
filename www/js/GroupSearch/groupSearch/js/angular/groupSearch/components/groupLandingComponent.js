import groupSearchModule from '../groupSearchModule';

const groupLanding = {
  templateUrl: 'group-landing',
  bindings: {
    myGroups: '<',
    search: '=',
    showAllFriendsGroups: '=',
    showAllMyGroups: '=',
    showCreateGroupButton: '<',
    handleCreateGroupClick: '<',
    handleViewGroupDetailsClick: '<',
    handleResultExposure: '<',
    handleFriendsGroupClick: '<',
    handleFriendsResultExposure: '<',
    isV2: '<'
  },
  controller: 'groupLandingController'
};

groupSearchModule.component('groupLanding', groupLanding);

export default groupLanding;
