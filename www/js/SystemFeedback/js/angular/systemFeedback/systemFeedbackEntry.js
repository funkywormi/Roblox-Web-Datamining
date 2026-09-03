import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import systemFeedbackModule from './systemFeedbackModule';

importFilesUnderPath(require.context("../systemFeedback/components/", true, /\.js$/));
importFilesUnderPath(require.context("../systemFeedback/services/", true, /\.js$/));

let templateContext = require.context("./", true, /\.html$/);

templateCacheGenerator(angular, 'systemFeedbackHtmlTemplate', templateContext);

export default systemFeedbackModule;