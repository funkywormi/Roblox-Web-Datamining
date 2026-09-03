import { useLocation } from "react-router-dom";
import { parseQueryString } from "./parsingUtils";

export enum AppsFlyerRefParams {
  AfAd = "af_ad",
  AfAdId = "af_ad_id",
  AfAdset = "af_adset",
  AfAdsetId = "af_adset_id",
  AfChannel = "af_channel",
  AfCid = "af_c_id",
  AfSub1 = "af_sub1",
  AfSub2 = "af_sub2",
  AfSub4 = "af_sub4",
  C = "c",
  Pid = "pid",
  Gclid = "gclid",
  Fbclid = "fbclid",
}

export type TAppsFlyerRefParams = {
  [key in AppsFlyerRefParams]: string | number;
};

export const AppsFlyerReferralParamsDeeplinkConfig: Record<AppsFlyerRefParams, string[]> = {
  [AppsFlyerRefParams.AfAd]: ["utm_adname", "af_ad"],
  [AppsFlyerRefParams.AfAdId]: ["utm_adid", "af_ad_id"],
  [AppsFlyerRefParams.AfAdset]: ["utm_adset", "af_adset"],
  [AppsFlyerRefParams.AfAdsetId]: ["utm_adsetid", "af_adset_id"],
  [AppsFlyerRefParams.AfChannel]: ["utm_channel", "af_channel"],
  [AppsFlyerRefParams.AfCid]: ["utm_id", "af_c_id"],
  [AppsFlyerRefParams.AfSub1]: ["gclid", "af_sub1"],
  [AppsFlyerRefParams.Gclid]: ["gclid", "gclid"],
  [AppsFlyerRefParams.AfSub2]: ["fbclid", "af_sub2"],
  [AppsFlyerRefParams.Fbclid]: ["fbclid", "fbclid"],
  [AppsFlyerRefParams.C]: ["utm_campaign", "c"],
  [AppsFlyerRefParams.Pid]: ["utm_source", "pid"],
  [AppsFlyerRefParams.AfSub4]: ["utm_control_test", "af_sub4"],
};

export const getAppsFlyerReferralParams = (
  location: Location | ReturnType<typeof useLocation> = window.location,
): Partial<TAppsFlyerRefParams> => {
  const params = parseQueryString(location.search);
  if (!params) {
    return {} as Partial<TAppsFlyerRefParams>;
  }
  // for each possible set of referral keys, find the first matching one that exists in the params
  return Object.entries(AppsFlyerReferralParamsDeeplinkConfig).reduce<Partial<TAppsFlyerRefParams>>(
    (acc, [key, value]) => {
      const firstMatchingKey = value.find(
        possibleKey => params[possibleKey] !== undefined && params[possibleKey] !== null,
      );

      if (
        firstMatchingKey &&
        (typeof params[firstMatchingKey] === "string" ||
          typeof params[firstMatchingKey] === "number")
      ) {
        acc[key as AppsFlyerRefParams] = params[firstMatchingKey] as string | number;
      }
      return acc;
    },
    {},
  );
};

export default { getAppsFlyerReferralParams };
