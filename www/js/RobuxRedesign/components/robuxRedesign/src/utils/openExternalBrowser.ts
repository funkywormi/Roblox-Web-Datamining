import { window } from "@rbx/core-lib/browser";
import { isAndroidApp } from "./platform";
import { getRobloxAppMinorVersion } from "./appVersion";

const OPEN_EXTERNAL_BROWSER_DEEP_LINK = "roblox://open-external";
const MIN_OPEN_EXTERNAL_BROWSER_APP_MINOR_VERSION = 743;

// The Android app (2.728+) loads target="_blank" links in a hidden WebView; 2.743+ supports the
// open-external deep link (MOBAPP-3220) to hand those off to the external browser instead.
// Fails closed when the app version can't be read from the user agent.
export const shouldOpenInExternalBrowser = (): boolean => {
  if (!isAndroidApp) {
    return false;
  }
  const minorVersion = getRobloxAppMinorVersion();
  return minorVersion !== null && minorVersion >= MIN_OPEN_EXTERNAL_BROWSER_APP_MINOR_VERSION;
};

// The Android app's open-external deep link only accepts absolute http(s) URLs.
export const getOpenExternalBrowserUrl = (url: string): string => {
  const absoluteUrl = window ? new URL(url, window.location.href).href : url;
  return `${OPEN_EXTERNAL_BROWSER_DEEP_LINK}?url=${encodeURIComponent(absoluteUrl)}`;
};

export const getExternalLinkProps = (url: string): { href: string; target?: "_blank" } =>
  shouldOpenInExternalBrowser()
    ? { href: getOpenExternalBrowserUrl(url) }
    : { href: url, target: "_blank" };
