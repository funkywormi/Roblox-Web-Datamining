// TODO: old, migrated cdoe
/* eslint-disable no-undef */
import angular from "angular";
import { importAll, templateCacheGenerator } from "@rbx/core-scripts/angular";
import { addExternal } from "@rbx/externals";
import * as thumbnail3d from "./src";

import thumbnails3dModule from "./src/angular/thumbnails3dModule";

addExternal("RobloxThumbnail3d", thumbnail3d);

importAll(require.context("./src/angular/components/", true, /\.js$/));
importAll(require.context("./src/angular/controllers/", true, /\.js$/));
importAll(require.context("./src/angular/services/", true, /\.js$/));
importAll(require.context("./src/angular/directives/", true, /\.js$/));

const templateContext = require.context("./src/angular/", true, /\.html$/);

templateCacheGenerator(angular, "thumbnails3dTemplates", templateContext, null);

export default thumbnails3dModule;
