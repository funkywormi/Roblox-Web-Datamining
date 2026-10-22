import { window } from "@rbx/core-lib/browser";
import { isAndroidApp } from "./platform";

const OPEN_EXTERNAL_BROWSER_DEEP_LINK = "roblox://open-external";

// The Android app's open-external deep link (MOBAPP-3220) only accepts absolute http(s) URLs.
export const getOpenExternalBrowserUrl = (url: string): string => {
  const absoluteUrl = window ? new URL(url, window.location.href).href : url;
  return `${OPEN_EXTERNAL_BROWSER_DEEP_LINK}?url=${encodeURIComponent(absoluteUrl)}`;
};

// The Android app (2.728+) loads target="_blank" links in a hidden WebView, so links that open a new
// tab elsewhere go through the open-external deep link there instead.
export const getExternalLinkProps = (url: string): { href: string; target?: "_blank" } =>
  isAndroidApp ? { href: getOpenExternalBrowserUrl(url) } : { href: url, target: "_blank" };
