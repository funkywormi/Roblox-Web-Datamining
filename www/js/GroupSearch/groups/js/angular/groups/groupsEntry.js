import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/groups.scss';

import groupsModule from './groupsModule';

importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'groupsTemplates', templateContext);
export default groupsModule;
