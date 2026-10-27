import { window } from "@rbx/core-lib/browser";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { navigateToInAppDeepLink } from "./inAppDeepLink";

export async function openNativeOdpFlow(odpSessionId: string): Promise<boolean> {
  const device = getDeviceMeta();
  if (
    device?.isInApp !== true ||
    !odpSessionId ||
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- typed as always present, but absent on Next.js
    (device.isIosApp && !window?.Roblox?.Hybrid?.Navigation?.navigateToFeature)
  ) {
    return false;
  }
  try {
    const params = new URLSearchParams({ odpSessionId });
    return await navigateToInAppDeepLink(
      `roblox://navigation/odp_checkpoint_resume?${params.toString()}`,
    );
  } catch {
    return false;
  }
}
