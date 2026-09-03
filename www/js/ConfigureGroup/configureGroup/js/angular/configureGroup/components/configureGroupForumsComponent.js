import configureGroupModule from '../configureGroupModule';

const configureGroupForums = {
  templateUrl: 'configure-group-forums',
  bindings: {
    group: '<',
    permissions: '<',
    channelsPermissions: '<',
    policies: '<',
    metadata: '<'
  },
  controller: 'configureGroupForumsController'
};

configureGroupModule.component('configureGroupForums', configureGroupForums);
export default configureGroupForums;
