import groupModule from '../groupModule';

const groupStore = {
  templateUrl: 'group-store',
  bindings: {
    groupId: '<',
    groupName: '<',
    permissions: '<',
    metadata: '<'
  },
  controller: 'groupStoreController'
};

groupModule.component('groupStore', groupStore);

export default groupStore;
