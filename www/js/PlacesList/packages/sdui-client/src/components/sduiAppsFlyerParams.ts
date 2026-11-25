import { QueryParamStore, readParam } from "@rbx/sdui-core";
import type { AnalyticsContext } from "@rbx/sdui-core";
import type { AppsFlyerDownloadParams } from "@rbx/app-download/TokenizedDownloadButton";
import { getAppsFlyerReferralParams } from "@rbx/www-common/apps-flyer";

export type SduiAppsFlyerLinkParams = {
  afDp?: string;
  afWebDp?: string;
  deepLinkValue?: string;
};

/**
 * Referral keys come from the shared AppsFlyer map. A marketing campaign (`c` or
 * `utm_campaign`) always wins. Deep-link fields come from the button props, not
 * the page query string.
 *
 */
export const buildSduiAppsFlyerParams = (
  analyticsContext?: AnalyticsContext,
  linkParams?: SduiAppsFlyerLinkParams,
): AppsFlyerDownloadParams => {
  const query = QueryParamStore.getInstance().snapshot().get("") ?? {};
  const experimentArm = readParam(
    analyticsContext?.getAnalyticsDataSnapshot(),
    "experimentArm",
    "experiment_arm",
  )?.trim();
  const referralParams: AppsFlyerDownloadParams = { ...getAppsFlyerReferralParams(query) };

  // Temporary until mobile web has BTID stitching. When the query has no campaign,
  // the analytics experiment arm is written to `c` so installs can be grouped for
  // approximate post install analysis.
  if (!referralParams.c && experimentArm) {
    referralParams.c = experimentArm;
  }
  return {
    ...referralParams,
    af_dp: linkParams?.afDp,
    af_web_dp: linkParams?.afWebDp,
    deep_link_value: linkParams?.deepLinkValue,
  };
};
