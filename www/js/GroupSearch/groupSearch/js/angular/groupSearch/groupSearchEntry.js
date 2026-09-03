import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/groupSearch.scss';

// import main module definition.
import groupSearchModule from './groupSearchModule';

importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'groupSearchAppHtmlTemplateApp', templateContext);

// self manual initialization
angular.element(function () {
  const webAppContainer =
    document.getElementById('group-search-web-app') ||
    document.getElementById('group-search-container');

  // Add the group-results-base attribute if it doesn't already exist
  if (
    webAppContainer === document.getElementById('group-search-web-app') &&
    !webAppContainer.hasAttribute('group-results-base')
  ) {
    webAppContainer.setAttribute('group-results-base', '');
  }
  angular.bootstrap(`#${webAppContainer.id}`, [groupSearchModule.name, templates.name]);
});

export default groupSearchModule;
