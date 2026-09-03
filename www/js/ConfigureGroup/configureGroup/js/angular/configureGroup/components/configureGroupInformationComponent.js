import configureGroupModule from '../configureGroupModule';

const configureGroupInformation = {
  templateUrl: 'configure-group-information',
  bindings: {
    group: '<',
    metadata: '<'
  },
  controller: 'configureGroupInformationController'
};

configureGroupModule.component('configureGroupInformation', configureGroupInformation);
export default configureGroupInformation;
