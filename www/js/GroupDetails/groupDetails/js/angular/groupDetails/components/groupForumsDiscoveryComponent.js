import groupModule from '../groupModule';

const groupForumsDiscovery = {
  templateUrl: 'group-forums-discovery',
  bindings: {
    groupId: '<',
    permissions: '<',
    channelsPermissions: '<',
    isGroupMember: '<',
    isEnabled: '<'
  },
  controller: 'groupForumsDiscoveryController'
};

groupModule.component('groupForumsDiscovery', groupForumsDiscovery);
export default groupForumsDiscovery;
