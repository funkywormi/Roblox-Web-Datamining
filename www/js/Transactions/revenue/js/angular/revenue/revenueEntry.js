import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/transactions.scss';

// import main module definition.
import revenueModule from './revenueModule';

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./constants/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);
templateCacheGenerator(angular, 'revenueTemplates', templateContext);

export default revenueModule;
