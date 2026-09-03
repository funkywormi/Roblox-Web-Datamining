import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/createGroup.scss';

// import main module definition.
import createGroupModule from './createGroupModule';

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'createGroupTemplates', templateContext);

// self manual initialization
angular.element(function () {
  const webAppContainer =
    document.getElementById('create-group-web-app') || document.getElementById('create-group');
  const bootstrapContainer =
    webAppContainer.querySelector('create-group-page') ||
    document.createElement('create-group-page');
  webAppContainer.appendChild(bootstrapContainer);
  angular.bootstrap(`#${webAppContainer.id}`, [createGroupModule.name, templates.name]);
});

export default createGroupModule;
