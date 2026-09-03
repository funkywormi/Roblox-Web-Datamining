import configureGroupModule from '../configureGroupModule';

const configureGroupRolesV2 = {
  templateUrl: 'configure-group-roles-v2',
  bindings: {
    group: '<',
    metadata: '<'
  },
  controller: 'configureGroupRolesV2Controller'
};

configureGroupModule.component('configureGroupRolesV2', configureGroupRolesV2);
export default configureGroupRolesV2;
