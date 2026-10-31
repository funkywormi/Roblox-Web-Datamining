import { DeviceMeta } from "@rbx/www-common/device/types";

export const getIsWebCheckoutPlatform = (device: DeviceMeta) => {
  return (
    (device.isDesktop && !device.isUWPApp && !device.isPcGdkApp) ||
    (!device.isAmazonApp &&
      !device.isUWPApp &&
      !device.isIosApp &&
      !device.isAndroidApp &&
      !device.isPcGdkApp)
  );
};

export const getIsNativePurchasePlatform = (device: DeviceMeta) => {
  return (
    device.isAmazonApp ||
    device.isUWPApp ||
    device.isIosApp ||
    device.isAndroidApp ||
    device.isPcGdkApp
  );
};
