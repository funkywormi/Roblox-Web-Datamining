import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

//main module
import premiumModule from './premiumModule';

//all other files that we want attached to the module.
importFilesUnderPath(require.context("./constants/", true, /\.js$/));
importFilesUnderPath(require.context("./services/", true, /\.js$/));

export default premiumModule;