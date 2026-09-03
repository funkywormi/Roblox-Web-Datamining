import angular from "angular";
import { importFilesUnderPath, templateCacheGenerator } from "roblox-es6-migration-helper";
import assetsExplorerModule from "../assetsExplorer/assetsExplorerEntry.js";

import favoritesModule from "./favoritesModule";

importFilesUnderPath(require.context("./constants/", true, /\.js$/));
importFilesUnderPath(require.context("./services/", true, /\.js$/));
importFilesUnderPath(require.context("./controllers/", true, /\.js$/));
importFilesUnderPath(require.context("./components/", true, /\.js$/));

let templateContext = require.context("./", true, /\.html$/);

let templates = templateCacheGenerator(angular, "favoritesAppTemplates", templateContext);

//self manual initialization
angular.element(function () {
    angular.bootstrap("#favorites-container", [favoritesModule.name, templates.name]);
});

export default favoritesModule;