import { getDeviceMeta, isMac, isWindows } from "@rbx/core-scripts/meta/device";
import { Browser, currentBrowser } from "@rbx/core-scripts/util/current-browser";

/**
 * Whether Play on Web can show on this browser and device: Chrome, on Windows or Mac desktop or
 * on Android, outside the Roblox app. The browser gate for the probe, so it never runs where the
 * button can't show. Reads the page on every call, so it needs the browser.
 */
export const isSupportedBrowserAndDevice = (): boolean => {
  const deviceMeta = getDeviceMeta();
  return (
    currentBrowser() === Browser.Chrome &&
    deviceMeta !== null &&
    !deviceMeta.isInApp &&
    ((deviceMeta.isDesktop && (isWindows() || isMac())) || deviceMeta.isAndroidDevice)
  );
};
