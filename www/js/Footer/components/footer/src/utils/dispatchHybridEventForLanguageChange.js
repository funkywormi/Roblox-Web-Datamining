import { DeviceMeta } from "@rbx/core-scripts/legacy/Roblox";
import { hybridService } from "@rbx/core-scripts/legacy/core-roblox-utilities";

function dispatchHybridEventForLanguageChange(localeCode, callback) {
  if (DeviceMeta && hybridService) {
    const deviceMeta = new DeviceMeta();
    const isRobloxApp = deviceMeta.isInApp;
    if (isRobloxApp && hybridService.localization) {
      hybridService.localization(localeCode, callback);
    }
  }
}

export default dispatchHybridEventForLanguageChange;
