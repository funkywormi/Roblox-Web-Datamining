import RouterPath from "../../../enums/RouterPath";
import { TSettingsUIPolicyBody } from "../../../types/policyTypes";

// Tabs shown only when the settings UI policy allows them. If the policy can't be
// loaded, all of these are removed.
export const policyDrivenTabs: RouterPath[] = [
  RouterPath.Notifications,
  RouterPath.Billing,
  RouterPath.Subscriptions,
  RouterPath.ParentalControls,
  RouterPath.AppPermissions,
  RouterPath.ManageRecommendations,
];

/**
 * Tabs the loaded settings UI policy turns off. Removed tabs aren't routes any more, so a
 * direct hit on their URL falls through to the default tab.
 */
export const getTabsToRemoveForPolicy = (policy: TSettingsUIPolicyBody): RouterPath[] => {
  const tabsToRemove: RouterPath[] = [];
  if (!policy.displayReactNotificationsTab) {
    // GUAC policy excludes under 13 users because we can't prompt them to enable
    // push notifications, so there's no reason for them to be
    // configurable.
    tabsToRemove.push(RouterPath.Notifications);
  }
  if (!policy.displaySubscriptionsTab) {
    tabsToRemove.push(RouterPath.Subscriptions);
  }
  if (!policy.displayParentalControlTab) {
    tabsToRemove.push(RouterPath.ParentalControls);
  }
  if (!policy.displayAppPermissionsTab) {
    tabsToRemove.push(RouterPath.AppPermissions);
  }
  if (!policy.displayManageRecommendationsTab) {
    tabsToRemove.push(RouterPath.ManageRecommendations);
  }
  return tabsToRemove;
};
