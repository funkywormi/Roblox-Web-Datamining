import angular from "angular";
import { importAll, templateCacheGenerator } from "@rbx/core-scripts/angular";

// import main scss file
import "@rbx/core-ui/styleGuide/styleGuide.scss";

// import main module definition.
import "./src/toast/toastModule";
import "./src/infiniteScroll/infiniteScrollModule";
import "./src/verticalMenu/verticalMenuModule";
import "./src/modal/modalModule";
import "./src/limitedIcon/limitedIconModule";

importAll(require.context("./src/toast/directives/", true, /\.js$/));
const toastTemplateContext = require.context("./src/toast/", true, /\.html$/);
templateCacheGenerator(angular, "toastHtmlTemplate", toastTemplateContext);

importAll(require.context("./src/infiniteScroll/directives/", true, /\.js$/));
importAll(require.context("./src/verticalMenu/directives/", true, /\.js$/));

importAll(require.context("./src/modal/constants", true, /\.js$/));
importAll(require.context("./src/modal/controllers", true, /\.js$/));
importAll(require.context("./src/modal/services", true, /\.js$/));
const modalTemplateContext = require.context("./src/modal/", true, /\.html$/);
templateCacheGenerator(angular, "modalHtmlTemplate", modalTemplateContext);

importAll(require.context("./src/limitedIcon/directives/", true, /\.js$/));
const limitedIconTemplateContext = require.context("./src/limitedIcon/", true, /\.html$/);
templateCacheGenerator(angular, "limitedIconTemplate", limitedIconTemplateContext);
