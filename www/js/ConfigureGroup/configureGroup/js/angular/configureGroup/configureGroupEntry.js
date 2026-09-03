import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/configureGroup.scss';

// import main module definition.
import configureGroupModule from './configureGroupModule';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'configureGroupTemplates', templateContext);

// self manual initialization
angular.element(function () {
  const webAppContainer =
    document.getElementById('configure-group-web-app') ||
    document.getElementById('configure-group');

  // Add the configure-group-page element if it doesn't already exist
  if (
    webAppContainer === document.getElementById('configure-group-web-app') &&
    !webAppContainer.querySelector('configure-group-page')
  ) {
    const bootstrapContainer = document.createElement('configure-group-page');
    webAppContainer.appendChild(bootstrapContainer);
  }
  angular.bootstrap(`#${webAppContainer.id}`, [configureGroupModule.name, templates.name]);
});

export default configureGroupModule;
