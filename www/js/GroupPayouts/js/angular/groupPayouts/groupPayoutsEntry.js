import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/groupPayouts.scss';

// import main module definition.
import groupPayoutsModule from './groupPayoutsModule';

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./components/', true, /\.js$/));
importFilesUnderPath(require.context('./constants/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

templateCacheGenerator(angular, 'groupPayoutsTemplates', templateContext);

export default groupPayoutsModule;
