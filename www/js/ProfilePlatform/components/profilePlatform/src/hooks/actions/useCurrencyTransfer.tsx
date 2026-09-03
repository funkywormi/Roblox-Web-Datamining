import { useCallback } from "react";
import { getDeviceMeta, isIos13Ipad } from "@rbx/core-scripts/meta/device";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";

const APPSFLYER_BASE_URL = "https://ro.blox.com/Ebh5";
const APPSFLYER_PID = "profile-currency-transfer";

function buildAppsFlyerUrl(deepLinkUrl: string): string {
  const url = new URL(APPSFLYER_BASE_URL);
  url.search = new URLSearchParams({
    pid: APPSFLYER_PID,
    is_retargeting: "false",
    deep_link_value: deepLinkUrl,
  }).toString();
  return url.toString();
}

const useCurrencyTransfer = (): ActionHookResult => {
  const { profileId } = useProfilePlatformContext();

  const handler = useCallback(() => {
    const deepLink = `roblox://navigation/currency_transfer?direction=send&userid=${profileId}&transferorigination=profile`;
    const deviceMeta = getDeviceMeta();

    if (deviceMeta?.isInApp) {
      window.location.href = deepLink;
    } else if (
      deviceMeta?.isIosDevice ||
      deviceMeta?.isAndroidDevice ||
      isIos13Ipad() ||
      deviceMeta?.isChromeOs
    ) {
      // AppsFlyer handles app-not-installed case: redirects to App Store / Play Store
      window.location.href = buildAppsFlyerUrl(deepLink);
    } else if (deviceMeta?.isDesktop && !deviceMeta.isUniversalApp) {
      if (window.Roblox.ProtocolHandlerClientInterface?.startDeepLinkFlow) {
        window.Roblox.ProtocolHandlerClientInterface.startDeepLinkFlow(deepLink);
      } else {
        window.location.href = deepLink;
      }
    } else {
      window.location.href = deepLink;
    }
  }, [profileId]);

  return { handler };
};

export default useCurrencyTransfer;
