import configureGroupModule from '../configureGroupModule';

const configureGroupAnalytics = {
  templateUrl: 'configure-group-analytics',
  bindings: {
    group: '<',
    metadata: '<'
  },
  controller: 'configureGroupAnalyticsController'
};

configureGroupModule.component('configureGroupAnalytics', configureGroupAnalytics);
export default configureGroupAnalytics;
