import groupSearchModule from '../groupSearchModule';

const myGroups = {
  templateUrl: 'my-groups',
  bindings: {
    myGroups: '<',
    showAll: '=',
    showCreateGroupButton: '<',
    handleCreateGroupClick: '<',
    handleViewGroupDetailsClick: '<'
  },
  controller: 'myGroupsController'
};

groupSearchModule.component('myGroups', myGroups);

export default myGroups;
