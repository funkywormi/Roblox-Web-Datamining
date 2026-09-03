import configureGroupModule from '../configureGroupModule';

const configureGroupContentModeration = {
  templateUrl: 'configure-group-content-moderation',
  bindings: {
    group: '<',
    permissions: '<'
  },
  controller: 'configureGroupContentModerationController'
};

configureGroupModule.component('configureGroupContentModeration', configureGroupContentModeration);
export default configureGroupContentModeration;
