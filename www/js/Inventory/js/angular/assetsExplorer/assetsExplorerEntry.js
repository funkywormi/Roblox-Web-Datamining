import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/assetsExplorer/assetsExplorer.scss';

import assetsExplorerModule from './assetsExplorerModule';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./utils/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'assetsExplorerAppTemplates', templateContext);

export default assetsExplorerModule;
