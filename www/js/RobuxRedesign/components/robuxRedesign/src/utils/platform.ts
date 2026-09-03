import { getDeviceMeta } from "@rbx/core-scripts/meta/device";

const deviceMeta = getDeviceMeta();

export const isInUniversalApp = Boolean(deviceMeta?.isUniversalApp);
export const isSamsungGalaxyStoreApp = Boolean(deviceMeta?.isSamsungGalaxyStoreApp);
export const isAmazonApp = Boolean(deviceMeta?.isAmazonApp);
export const isPcGdkApp = Boolean(deviceMeta?.isPcGdkApp);

export const isOnDesktop = (() => {
  if (!deviceMeta) {
    return false;
  }

  return (
    (deviceMeta.isDesktop && !deviceMeta.isUWPApp && !deviceMeta.isPcGdkApp) ||
    (!deviceMeta.isAmazonApp &&
      !deviceMeta.isUWPApp &&
      !deviceMeta.isIosApp &&
      !deviceMeta.isAndroidApp &&
      !deviceMeta.isPcGdkApp)
  );
})();

export const isInApp = (() => {
  if (!deviceMeta) {
    return false;
  }

  return (
    deviceMeta.isAmazonApp ||
    deviceMeta.isUWPApp ||
    deviceMeta.isIosApp ||
    deviceMeta.isAndroidApp ||
    deviceMeta.isPcGdkApp
  );
})();
