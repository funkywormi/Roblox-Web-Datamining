import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/recommendations/recommendations.scss';

import recommendationsModule from './recommendationsModule';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'recommendationsAppTemplates', templateContext);

// self manual initialization
angular.element(() => {
  angular.bootstrap('#recommendations-container', [recommendationsModule.name, templates.name]);
});

export default recommendationsModule;
