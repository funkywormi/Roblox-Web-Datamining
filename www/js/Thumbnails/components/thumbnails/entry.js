// TODO: old, migrated code
/* eslint-disable no-undef */
import angular from "angular";
import { addExternal } from "@rbx/externals";
import { importAll, templateCacheGenerator } from "@rbx/core-scripts/angular";
import * as thumbnails from "./src";
import "./src/thumbnails.scss";
import "./src/angular/vendors/angularLazyImg";

// import main module definition.
import thumbnailsModule from "./src/angular/thumbnailsModule";

addExternal("RobloxThumbnails", thumbnails);

importAll(require.context("./src/angular/components/", true, /\.js$/));
importAll(require.context("./src/angular/constants/", true, /\.js$/));
importAll(require.context("./src/angular/controllers/", true, /\.js$/));
importAll(require.context("./src/angular/directives/", true, /\.js$/));
importAll(require.context("./src/angular/services/", true, /\.js$/));

const templateContext = require.context("./src/angular", true, /\.html$/);

templateCacheGenerator(angular, "thumbnailsTemplates", templateContext, null);

export default thumbnailsModule;
