import configureGroupModule from '../configureGroupModule';

function configureGroupAnalyticsController() {
  'ngInject';
}

configureGroupModule.controller(
  'configureGroupAnalyticsController',
  configureGroupAnalyticsController
);

export default configureGroupAnalyticsController;
