import configureGroupModule from '../configureGroupModule';

const configureGroupRoleSettings = {
  templateUrl: 'configure-group-role-settings',
  bindings: {
    groupRole: '<',
    permissions: '<',
    group: '<',
    metadata: '<',
    deleteRole: '&',
    permissionsConfig: '<',
    policies: '<'
  },
  controller: 'configureGroupRoleSettingsController'
};

configureGroupModule.component('configureGroupRoleSettings', configureGroupRoleSettings);
export default configureGroupRoleSettings;
