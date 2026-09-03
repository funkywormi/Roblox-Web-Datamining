import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

//import main scss file
import '../../../css/fileUpload/fileUpload.scss';

//import main module definition.
import fileUploadModule from './fileUploadModule';

importFilesUnderPath(require.context("./controllers/", true, /\.js$/));
importFilesUnderPath(require.context("./constants/", true, /\.js$/));
importFilesUnderPath(require.context("./components/", true, /\.js$/));
importFilesUnderPath(require.context("./directives/", true, /\.js$/));

let templateContext = require.context("./", true, /\.html$/);

templateCacheGenerator(angular, 'fileUploadHtmlTemplate', templateContext);

export default fileUploadModule;