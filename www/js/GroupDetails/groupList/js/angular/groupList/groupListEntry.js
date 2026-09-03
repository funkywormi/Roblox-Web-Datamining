import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/groupsList/_legacyGroupsList.scss';

//import main module definition.
import groupListModule from './groupListModule';

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./constants/', true, /\.js$/));

let templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'groupsListAppHtmlTemplateApp', templateContext);

// self manual initialization
angular.element(function () {
  angular.bootstrap('#groups-list-container:not([ng-modules])', [
    groupListModule.name,
    templates.name
  ]);
});

export default groupListModule;
