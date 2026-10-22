import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import dataStores from "@rbx/core-scripts/data-store";
import { useIsPlusBadgeEnabled } from "@rbx/identity-badges";
import { getIntAuthCompliancePolicy } from "./services/complianceService";
import {
  getCreditBalanceForNavigation,
  getGuacBehavior,
  getRobuxBadge,
  getUserCurrency,
  getVngShopSignedRedirectionUrl,
} from "./services/navigationService";
import { registerNavCapabilities } from "./util/navCapabilities";

registerNavCapabilities({
  getIntAuthCompliancePolicy,
  getNavigationHeaderBehavior: getGuacBehavior,
  getVngShopSignedRedirectionUrl: () => getVngShopSignedRedirectionUrl().then(({ data }) => data),
  getUserCurrency: userId => getUserCurrency(userId).then(({ data }) => data),
  getCreditBalanceForNavigation: () => getCreditBalanceForNavigation().then(({ data }) => data),
  getRobuxBadge: () => getRobuxBadge().then(({ data }) => data),
  useIsAccountSwitcherAvailableForBrowser: () =>
    AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser(),
  useIsPlusBadgeEnabled,
  saveGameIntentFromCurrentUrl: () => {
    dataStores.authIntentDataStore.saveGameIntentFromCurrentUrl();
  },
});
