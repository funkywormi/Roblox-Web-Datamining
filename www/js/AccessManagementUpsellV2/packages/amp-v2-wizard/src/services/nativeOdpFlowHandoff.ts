import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { navigateToDeepLink } from "@rbx/core-scripts/deep-link";

export async function openNativeOdpFlow(odpSessionId: string): Promise<boolean> {
  const device = getDeviceMeta();
  if (
    device?.isInApp !== true ||
    !odpSessionId ||
    (device.isIosApp && !window.Roblox.Hybrid?.Navigation?.navigateToFeature)
  ) {
    return false;
  }
  try {
    const params = new URLSearchParams({ odpSessionId });
    return await navigateToDeepLink(
      `roblox://navigation/odp_checkpoint_resume?${params.toString()}`,
    );
  } catch {
    return false;
  }
}
