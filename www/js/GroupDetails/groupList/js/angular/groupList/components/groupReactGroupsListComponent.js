import groupListModule from '../groupListModule';

const groupReactGroupsList = {
  templateUrl: 'group-react-groups-list',
  bindings: {
    currentGroup: '<',
    groupsList: '<',
    canCreateGroup: '<',
    isSidebar: '<',
    isLoadingGroups: '<',
    loadFailure: '<',
    showRanks: '<',
    showMemberCounts: '<',
    showButtonsOnTop: '<'
  }
};

groupListModule.component('groupReactGroupsList', groupReactGroupsList);
export default groupReactGroupsList;
