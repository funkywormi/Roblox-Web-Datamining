import groupModule from '../groupModule';

const groupForums = {
  templateUrl: 'group-forums',
  bindings: {
    group: '<',
    permissions: '<',
    channelsPermissions: '<',
    userId: '<',
    isGroupMember: '<',
    isEnabled: '<'
  },
  controller: 'groupForumsController'
};

groupModule.component('groupForums', groupForums);
export default groupForums;
