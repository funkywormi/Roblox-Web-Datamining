export enum AppsFlyerRefParam {
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

export type AppsFlyerReferralParams = Record<AppsFlyerRefParam, string>;

/** Query-string aliases for each AppsFlyer referral key, in precedence order. */
export const appsFlyerReferralParamSources: Record<AppsFlyerRefParam, readonly string[]> = {
  [AppsFlyerRefParam.AfAd]: ["utm_adname", "af_ad"],
  [AppsFlyerRefParam.AfAdId]: ["utm_adid", "af_ad_id"],
  [AppsFlyerRefParam.AfAdset]: ["utm_adset", "af_adset"],
  [AppsFlyerRefParam.AfAdsetId]: ["utm_adsetid", "af_adset_id"],
  [AppsFlyerRefParam.AfChannel]: ["utm_channel", "af_channel"],
  [AppsFlyerRefParam.AfCid]: ["utm_id", "af_c_id"],
  [AppsFlyerRefParam.AfSub1]: ["gclid", "af_sub1"],
  [AppsFlyerRefParam.Gclid]: ["gclid", "gclid"],
  [AppsFlyerRefParam.AfSub2]: ["fbclid", "af_sub2"],
  [AppsFlyerRefParam.Fbclid]: ["fbclid", "fbclid"],
  [AppsFlyerRefParam.C]: ["utm_campaign", "c"],
  [AppsFlyerRefParam.Pid]: ["utm_source", "pid"],
  [AppsFlyerRefParam.AfSub4]: ["utm_control_test", "af_sub4"],
};

const firstPresentValue = (
  query: Record<string, string>,
  sources: readonly string[],
): string | undefined => {
  for (const source of sources) {
    const value = query[source]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
};

/** Map a query-param record onto AppsFlyer referral keys. Empty values are omitted. */
export const getAppsFlyerReferralParams = (
  query: Record<string, string>,
): Partial<AppsFlyerReferralParams> => {
  const referralParams: Partial<AppsFlyerReferralParams> = {};
  for (const appsFlyerKey of Object.values(AppsFlyerRefParam)) {
    const value = firstPresentValue(query, appsFlyerReferralParamSources[appsFlyerKey]);
    if (value) {
      referralParams[appsFlyerKey] = value;
    }
  }
  return referralParams;
};
