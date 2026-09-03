// Do not import anything here without considering if you need to update the rspack.config.js

import { recordGet } from "@rbx/core-types";

const deviceDataset = (): DOMStringMap | null => {
  const metaTag = document.querySelector<HTMLMetaElement>(`meta[name="device-meta"]`);
  return metaTag?.dataset ?? null;
};

export const isIos13Ipad = (): boolean => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!window.navigator) {
    return false;
  }
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
};

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-deprecated
export const isMac = (): boolean => window.navigator.platform.toUpperCase().includes("MAC");

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-deprecated
export const isWindows = (): boolean => window.navigator.platform.toUpperCase().includes("WIN");

export const isIE = (): boolean =>
  window.navigator.userAgent.toUpperCase().includes("TRIDENT/") ||
  window.navigator.userAgent.toUpperCase().includes("MSIE");

export const isIE11 = (): boolean => isIE() && /rv[: ]\d+./.test(window.navigator.userAgent);

export const AppTypes = {
  android: "android",
  ios: "ios",
  xbox: "xbox",
  uwp: "uwp",
  amazon: "amazon",
  win32: "win32",
  universalapp: " universalApp",
  unknown: "unknown",
};

export const DeviceTypes = {
  computer: "computer",
  tablet: "tablet",
  phone: "phone",
  console: "console",
};

export type DeviceMeta = {
  deviceType: string;
  appType: string;
  isInApp: boolean;
  isDesktop: boolean;
  isPhone: boolean;
  isTablet: boolean;
  isConsole: boolean;
  isAndroidApp: boolean;
  isIosApp: boolean;
  isUWPApp: boolean;
  isXboxApp: boolean;
  isAmazonApp: boolean;
  isWin32App: boolean;
  isStudio: boolean;
  isIosDevice: boolean;
  isAndroidDevice: boolean;
  isUniversalApp: boolean;
  isChromeOs: boolean;
  isSamsungGalaxyStoreApp: boolean;
  isPcGdkApp: boolean;
};

export const getDeviceMeta = (): DeviceMeta | null => {
  const dataset = deviceDataset();
  return dataset == null
    ? null
    : {
        deviceType: dataset.deviceType ? (recordGet(DeviceTypes, dataset.deviceType) ?? "") : "",
        appType: dataset.appType ? (recordGet(AppTypes, dataset.appType) ?? "") : "",
        isInApp: dataset.isInApp === "true",
        isDesktop: dataset.isDesktop === "true",
        isPhone: dataset.isPhone === "true",
        isTablet: dataset.isTablet === "true",
        isConsole: dataset.isConsole === "true",
        isAndroidApp: dataset.isAndroidApp === "true",
        isIosApp: dataset.isIosApp === "true",
        isUWPApp: dataset.isUwpApp === "true",
        isXboxApp: dataset.isXboxApp === "true",
        isAmazonApp: dataset.isAmazonApp === "true",
        isWin32App: dataset.isWin32App === "true",
        isStudio: dataset.isStudio === "true",
        isIosDevice: dataset.isIosDevice === "true",
        isAndroidDevice: dataset.isAndroidDevice === "true",
        isUniversalApp: dataset.isUniversalApp === "true",
        isChromeOs: dataset.isChromeOs === "true",
        isSamsungGalaxyStoreApp: dataset.isSamsungGalaxyStoreApp === "true",
        isPcGdkApp: dataset.isPcgdkApp === "true",
      };
};
