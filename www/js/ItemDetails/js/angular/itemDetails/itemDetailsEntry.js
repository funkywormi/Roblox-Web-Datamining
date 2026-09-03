import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import itemDetailsModule from './itemDetailsModule';

import '../../../css/itemDetails/itemDetails.scss';

importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'itemDetailsAppTemplates', templateContext);
// self manual initialization
angular.element(() => {
  angular.bootstrap('#item-details-container', [itemDetailsModule.name, templates.name]);
});

export default itemDetailsModule;
