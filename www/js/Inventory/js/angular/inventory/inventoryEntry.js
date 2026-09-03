import angular from "angular";
import { importFilesUnderPath, templateCacheGenerator } from "roblox-es6-migration-helper";
import assetsExplorerModule from "../assetsExplorer/assetsExplorerEntry.js";

import inventoryModule from "./inventoryModule";

importFilesUnderPath(require.context("./constants/", true, /\.js$/));
importFilesUnderPath(require.context("./services/", true, /\.js$/));
importFilesUnderPath(require.context("./controllers/", true, /\.js$/));
importFilesUnderPath(require.context("./components/", true, /\.js$/));

let templateContext = require.context("./", true, /\.html$/);

let templates = templateCacheGenerator(angular, "inventoryAppTemplates", templateContext);

//self manual initialization
angular.element(function () {
    angular.bootstrap("#inventory-container", [inventoryModule.name, templates.name]);
});

export default inventoryModule;