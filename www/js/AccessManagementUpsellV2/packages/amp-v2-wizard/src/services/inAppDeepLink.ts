import { window } from "@rbx/core-lib/browser";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";

/** createDeepLinkNavigator for a link it passes through unchanged (amp_wizard, odp_checkpoint_resume). */
export const navigateToInAppDeepLink = (deepLinkUrl: string): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- typed as always present, but absent on Next.js
  const navigation = window?.Roblox?.Hybrid?.Navigation;
  if (getDeviceMeta()?.isIosApp && navigation?.navigateToFeature) {
    navigation.navigateToFeature({ feature: "DeepLink", deepLinkUrlPath: deepLinkUrl }, () => true);
    return Promise.resolve(true);
  }
  if (!window) {
    return Promise.resolve(false);
  }
  window.location.href = deepLinkUrl;
  return Promise.resolve(true);
};
