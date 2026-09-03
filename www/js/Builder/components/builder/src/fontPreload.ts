import "./main.scss";
import builderSansRegular from "@rbx/webfont/fonts/BuilderSans-Regular.woff2";
import builderSansMedium from "@rbx/webfont/fonts/BuilderSans-Medium.woff2"; // Used for matching legacy font weights usage, such as top nav
import builderSansSemiBold from "@rbx/webfont/fonts/BuilderSans-SemiBold.woff2";
import builderSansBold from "@rbx/webfont/fonts/BuilderSans-Bold.woff2";

import { buildFontPreloadHtml } from "./fontPreloadUtils.js";

const fonts = [builderSansRegular, builderSansMedium, builderSansSemiBold, builderSansBold];

export default buildFontPreloadHtml(fonts);
