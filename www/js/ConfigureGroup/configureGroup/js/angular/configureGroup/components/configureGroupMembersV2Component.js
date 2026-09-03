import configureGroupModule from '../configureGroupModule';

const configureGroupMembersV2 = {
  templateUrl: 'configure-group-members-v2',
  bindings: {
    group: '<',
    policies: '<',
    metadata: '<'
  },
  controller: 'configureGroupMembersV2Controller'
};

configureGroupModule.component('configureGroupMembersV2', configureGroupMembersV2);
export default configureGroupMembersV2;
