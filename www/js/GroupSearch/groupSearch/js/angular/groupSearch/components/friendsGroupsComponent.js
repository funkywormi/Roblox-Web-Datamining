import groupSearchModule from '../groupSearchModule';

const friendsGroups = {
  templateUrl: 'friends-groups',
  bindings: {
    myGroups: '<',
    keyword: '<',
    showAll: '=',
    handleViewGroupDetailsClick: '<',
    handleResultExposure: '<',
    isV2: '<'
  },
  controller: 'friendsGroupsController'
};

groupSearchModule.component('friendsGroups', friendsGroups);

export default friendsGroups;
