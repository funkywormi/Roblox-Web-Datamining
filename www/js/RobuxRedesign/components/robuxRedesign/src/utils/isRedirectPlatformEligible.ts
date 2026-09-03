import { getDeviceMeta } from "@rbx/core-scripts/meta/device";

export const isRedirectPlatformEligible = () => {
  const deviceMeta = getDeviceMeta();
  if (!deviceMeta) {
    return false;
  }
  return deviceMeta.isIosApp || deviceMeta.isAndroidApp;
};
