import { DeviceMeta } from 'Roblox';

const deviceInfo = DeviceMeta();
const isEligibleForUpsell =
  (deviceInfo.isPhone || deviceInfo.isTablet) &&
  (deviceInfo.isAndroidDevice || deviceInfo.isIosDevice);

export default { isEligibleForUpsell };
