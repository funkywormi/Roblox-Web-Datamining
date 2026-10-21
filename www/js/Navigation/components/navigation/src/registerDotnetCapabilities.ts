import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import dataStores from "@rbx/core-scripts/data-store";
import { getIntAuthCompliancePolicy } from "./services/complianceService";
import { getGuacBehavior, getVngShopSignedRedirectionUrl } from "./services/navigationService";
import { registerNavCapabilities } from "./util/navCapabilities";

registerNavCapabilities({
  getIntAuthCompliancePolicy,
  getNavigationHeaderBehavior: getGuacBehavior,
  getVngShopSignedRedirectionUrl: () => getVngShopSignedRedirectionUrl().then(({ data }) => data),
  useIsAccountSwitcherAvailableForBrowser: () =>
    AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser(),
  saveGameIntentFromCurrentUrl: () => {
    dataStores.authIntentDataStore.saveGameIntentFromCurrentUrl();
  },
});
