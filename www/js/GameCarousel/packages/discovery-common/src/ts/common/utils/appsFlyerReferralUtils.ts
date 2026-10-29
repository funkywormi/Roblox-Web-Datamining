import { window as browserWindow } from "@rbx/core-lib/browser";
import { UrlSearchParams } from "@rbx/core-lib/url";
import {
  AppsFlyerRefParam,
  getAppsFlyerReferralParams as getAppsFlyerReferralParamsFromQuery,
  type AppsFlyerReferralParams,
} from "@rbx/www-common/apps-flyer";

export { AppsFlyerRefParam as AppsFlyerRefParams };
export type TAppsFlyerRefParams = AppsFlyerReferralParams;

const searchToQueryRecord = (search: string): Record<string, string> => {
  const query: Record<string, string> = {};
  for (const [key, value] of UrlSearchParams.parse(search).entries()) {
    if (!(key in query)) {
      query[key] = value;
    }
  }
  return query;
};

/**
 * Read AppsFlyer referral params from a page location. The key map lives in
 * `@rbx/www-common/apps-flyer`; this wrapper only parses `location.search`.
 */
export const getAppsFlyerReferralParams = (location?: {
  search?: string;
}): Partial<TAppsFlyerRefParams> => {
  const search = location?.search ?? browserWindow?.location.search ?? "";
  return getAppsFlyerReferralParamsFromQuery(searchToQueryRecord(search));
};

export default { getAppsFlyerReferralParams };
