import "./main.scss";

import { buildFontPreloadHtml } from "./fontPreloadUtils.js";

const fonts = [
  "https://cdn.foundation.roblox.com/current/fonts/builder-sans/BuilderSans-Regular.woff2",
  "https://cdn.foundation.roblox.com/current/fonts/builder-sans/BuilderSans-Medium.woff2",
  "https://cdn.foundation.roblox.com/current/fonts/builder-sans/BuilderSans-SemiBold.woff2",
  "https://cdn.foundation.roblox.com/current/fonts/builder-sans/BuilderSans-Bold.woff2",
];

export default buildFontPreloadHtml(fonts);
