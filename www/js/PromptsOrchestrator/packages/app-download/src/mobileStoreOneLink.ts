import type { AppsFlyerReferralParams } from "@rbx/www-common/apps-flyer";
import { appDownloadType } from "./constants";
import type { ResolvedAppDownload } from "./resolveAppDownload";

export const MOBILE_STORE_ONELINK_URL = "https://ro.blox.com/Ebh5";

const DEFAULT_PID = "web_download_button";
const DEFAULT_AF_DP = "roblox://navigation/home";

export type AppsFlyerDownloadParams = Partial<AppsFlyerReferralParams> & {
  /** In-app destination. Unset keeps `roblox://navigation/home`. */
  af_dp?: string;
  /** Desktop web redirect. Unset omits the parameter. */
  af_web_dp?: string;
  /** AppsFlyer deep link value. Unset omits the parameter. */
  deep_link_value?: string;
};

const setIfPresent = (params: URLSearchParams, key: string, value: string | undefined): void => {
  const trimmed = value?.trim();
  if (trimmed) {
    params.set(key, trimmed);
  }
};

const applyStoreDefaults = (params: URLSearchParams, download?: ResolvedAppDownload): void => {
  if (download?.downloadType !== appDownloadType.AmazonAppStore) {
    return;
  }
  // The OneLink template sends Android traffic to Google Play. Fire tablets
  // need the resolved Amazon Appstore URL instead.
  setIfPresent(params, "af_android_url", download.href.toString());
};

/**
 * AppsFlyer OneLink for Apple, Google Play, and Amazon store clicks.
 * Defaults identify download-button installs. Caller values overlay those defaults.
 * Store-specific defaults, such as the Amazon Appstore URL, come from `download`.
 */
export const buildMobileStoreOneLink = (
  appsFlyerParams?: AppsFlyerDownloadParams,
  download?: ResolvedAppDownload,
): string => {
  const params = new URLSearchParams();
  params.set("pid", DEFAULT_PID);
  params.set("is_retargeting", "false");
  params.set("af_dp", DEFAULT_AF_DP);
  applyStoreDefaults(params, download);

  for (const [key, value] of Object.entries(appsFlyerParams ?? {})) {
    setIfPresent(params, key, value);
  }

  return `${MOBILE_STORE_ONELINK_URL}?${params.toString()}`;
};
