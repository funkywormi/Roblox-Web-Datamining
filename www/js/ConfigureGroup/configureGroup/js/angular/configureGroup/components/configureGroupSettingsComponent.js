import configureGroupModule from '../configureGroupModule';

const configureGroupSettings = {
  templateUrl: 'configure-group-settings',
  bindings: {
    group: '<',
    metadata: '<'
  },
  controller: 'configureGroupSettingsController'
};

configureGroupModule.component('configureGroupSettings', configureGroupSettings);
export default configureGroupSettings;
