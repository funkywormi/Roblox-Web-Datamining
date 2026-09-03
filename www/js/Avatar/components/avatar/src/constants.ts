import { getDeviceMeta } from "@rbx/core-scripts/meta/device";

const deviceInfo = getDeviceMeta();
const isEligibleForUpsell =
  (!!deviceInfo?.isPhone || !!deviceInfo?.isTablet) &&
  (!!deviceInfo?.isAndroidDevice || !!deviceInfo?.isIosDevice);

export default { isEligibleForUpsell };
