import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import dataStores from "@rbx/core-scripts/data-store";
import { getIntAuthCompliancePolicy } from "./services/complianceService";
import { registerNavCapabilities } from "./util/navCapabilities";

registerNavCapabilities({
  getIntAuthCompliancePolicy,
  useIsAccountSwitcherAvailableForBrowser: () =>
    AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser(),
  saveGameIntentFromCurrentUrl: () => {
    dataStores.authIntentDataStore.saveGameIntentFromCurrentUrl();
  },
});
