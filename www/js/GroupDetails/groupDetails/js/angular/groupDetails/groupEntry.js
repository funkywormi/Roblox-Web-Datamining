import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/groupDetails.scss';
import '../../../css/groupCoverPhoto.scss';

// import main module definition.
import groupModule from './groupModule';

importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./filters/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'groupDetailsHtmlTemplateApp', templateContext);

// self manual initialization
angular.element(function () {
  angular.bootstrap('#group-container:not([ng-modules])', [groupModule.name, templates.name]);
});

export default groupModule;
