import { Browser, DeviceMeta } from "./types";

export const deviceMetaDataAttributes = (deviceMeta: DeviceMeta) => ({
  "data-browser": deviceMeta.browser,
  "data-device-type": deviceMeta.deviceType,
  "data-operating-system": deviceMeta.operatingSystem,
  "data-is-in-app": String(deviceMeta.isInApp),
  "data-is-desktop": String(deviceMeta.isDesktop),
  "data-is-phone": String(deviceMeta.isPhone),
  "data-is-tablet": String(deviceMeta.isTablet),
  "data-is-console": String(deviceMeta.isConsole),
  "data-is-android-app": String(deviceMeta.isAndroidApp),
  "data-is-ios-app": String(deviceMeta.isIosApp),
  "data-is-uwp-app": String(deviceMeta.isUWPApp),
  "data-is-xbox-app": String(deviceMeta.isXboxApp),
  "data-is-amazon-app": String(deviceMeta.isAmazonApp),
  "data-is-win32-app": String(deviceMeta.isWin32App),
  "data-is-studio": String(deviceMeta.isStudio),
  "data-is-ios-device": String(deviceMeta.isIosDevice),
  "data-is-android-device": String(deviceMeta.isAndroidDevice),
  "data-is-universal-app": String(deviceMeta.isUniversalApp),
  "data-app-type": deviceMeta.appType,
  "data-is-chrome-os": String(deviceMeta.isChromeOs),
  "data-is-pcgdk-app": String(deviceMeta.isPcGdkApp),
  "data-is-samsung-galaxy-store-app": String(deviceMeta.isSamsungGalaxyStoreApp),
  "data-is-mac": String(deviceMeta.isMac),
  "data-is-windows": String(deviceMeta.isWindows),
});

export const defaultDeviceMeta: DeviceMeta = {
  browser: "unknown",
  deviceType: "unknown",
  operatingSystem: "unknown",
  appType: "unknown",
  isInApp: false,
  isDesktop: false,
  isPhone: false,
  isTablet: false,
  isConsole: false,
  isAndroidApp: false,
  isIosApp: false,
  isUWPApp: false,
  isXboxApp: false,
  isAmazonApp: false,
  isWin32App: false,
  isStudio: false,
  isIosDevice: false,
  isAndroidDevice: false,
  isUniversalApp: false,
  isChromeOs: false,
  isPcGdkApp: false,
  isSamsungGalaxyStoreApp: false,
  isMac: false,
  isWindows: false,
};

// Browser is absent from both DOM device sources, so callers derive it from `navigator.userAgent`.
// Mobile browsers on iOS all carry `Safari/`, and Edge on Android carries `Chrome/`, so the
// vendor-specific tokens (FxiOS/CriOS/EdgiOS/EdgA) must be matched before the generic ones.
export const browserFromUserAgent = (userAgent: string): Browser => {
  if (/Firefox\/|FxiOS\//i.test(userAgent)) {
    return "firefox";
  }
  if (/Edg(?:e|A|iOS)?\//i.test(userAgent)) {
    return "edge";
  }
  if (/Chrome\/|CriOS\//i.test(userAgent)) {
    return "chrome";
  }
  if (/Safari\//i.test(userAgent)) {
    return "safari";
  }
  return "unknown";
};
