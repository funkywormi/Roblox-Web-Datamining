import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/resellers/resellers.scss';

let Highcharts;
let HighchartsDataModule;
if (!window.Highcharts) {
  Highcharts = require('highcharts');
  HighchartsDataModule = require('highcharts/modules/data');
  HighchartsDataModule(Highcharts);
  window.Highcharts = Highcharts;
}
import resellersModule from './resellersModule';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'resellersAppTemplates', templateContext);

// self manual initialization
angular.element(function() {
  angular.bootstrap('#asset-resale-data-pane,asset-resale-pane', [resellersModule.name]);
});

export default resellersModule;
