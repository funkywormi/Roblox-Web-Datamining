import { importFilesUnderPath } from "roblox-es6-migration-helper";

import socialLinksCommonModule from "./socialLinksCommonModule";

importFilesUnderPath(require.context("./constants/", true, /\.js$/));
importFilesUnderPath(require.context("./services/", true, /\.js$/));

export default socialLinksCommonModule;