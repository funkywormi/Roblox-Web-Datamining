import { DeviceMeta } from "@rbx/www-common/device/types";

export const isRedirectPlatformEligible = (device: DeviceMeta) => {
  return device.isIosApp || device.isAndroidApp;
};
