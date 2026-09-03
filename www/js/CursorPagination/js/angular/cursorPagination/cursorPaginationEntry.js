import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

let templateContext = require.context("../cursorPagination/", true, /\.html$/);
templateCacheGenerator(angular, 'cursorPaginationHtmlTemplate', templateContext);

//import main module definition.
import cursorPaginationModule from './cursorPaginationModule';

importFilesUnderPath(require.context("../cursorPagination/constants/", true, /\.js$/));
importFilesUnderPath(require.context("../cursorPagination/directives/", true, /\.js$/));
importFilesUnderPath(require.context("../cursorPagination/services/", true, /\.js$/));
