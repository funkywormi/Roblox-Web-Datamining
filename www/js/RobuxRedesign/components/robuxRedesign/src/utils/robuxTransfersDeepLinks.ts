import { getDeviceMeta, isIos13Ipad } from "@rbx/core-scripts/meta/device";
import { trackCounter } from "../observability";
import { isInApp } from "./platform";

const APPSFLYER_BASE_URL = "https://ro.blox.com/Ebh5";
const APPSFLYER_PID = "buy-robux-currency-transfer";

function getAppsFlyerUrl(deepLinkUrl: string): string {
  const url = new URL(APPSFLYER_BASE_URL);
  url.search = new URLSearchParams({
    pid: APPSFLYER_PID,
    is_retargeting: "false",
    deep_link_value: deepLinkUrl,
  }).toString();
  return url.toString();
}

function navigateToDeepLink(deepLinkUrl: string): void {
  const deviceMeta = getDeviceMeta();
  if (isInApp) {
    window.location.href = deepLinkUrl;
  } else if (
    deviceMeta?.isIosDevice ||
    deviceMeta?.isAndroidDevice ||
    isIos13Ipad() ||
    deviceMeta?.isChromeOs
  ) {
    window.location.href = getAppsFlyerUrl(deepLinkUrl);
  } else if (deviceMeta?.isDesktop && !deviceMeta.isUniversalApp) {
    if (window.Roblox.ProtocolHandlerClientInterface?.startDeepLinkFlow) {
      window.Roblox.ProtocolHandlerClientInterface.startDeepLinkFlow(deepLinkUrl);
    } else {
      window.location.href = deepLinkUrl;
    }
  } else {
    window.location.href = deepLinkUrl;
  }
}

function buildCurrencyTransferDeepLink(params: Record<string, string>): string {
  const url = new URL("roblox://navigation/currency_transfer");
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}

export function navigateToSendTransferDeepLink(userId: number): void {
  trackCounter("SendTransferDeepLink");
  navigateToDeepLink(
    buildCurrencyTransferDeepLink({
      direction: "send",
      userid: String(userId),
      transferorigination: "buyRobux",
    }),
  );
}

export function navigateToAcceptTransferDeepLink(transferRequestId: string): void {
  trackCounter("PendingTransferDeepLink");
  navigateToDeepLink(
    buildCurrencyTransferDeepLink({
      direction: "receive",
      transferrequestid: `RXT-${transferRequestId}`,
    }),
  );
}
