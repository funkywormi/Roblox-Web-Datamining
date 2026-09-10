import environmentUrls from "@rbx/environment-urls";
import Intl from "@rbx/core-scripts/intl";
import chatHttpTransport from "./chatHttpTransport";
import type { TCountryRegion, TCountryRegionsResponse } from "../types/api";

/**
 * Fetch localized country/region names, keyed by region code. Used by the contact card's
 * account-location profile insight. Mirrors the legacy chat localeService.
 */
export const getCountryRegions = async (): Promise<Record<string, TCountryRegion>> => {
  const locale = new Intl().getRobloxLocale();
  const body = await chatHttpTransport.get<TCountryRegionsResponse>({
    url: `${environmentUrls.localeApi}/v1/country-regions?locale=${locale}`,
    retryable: true,
    withCredentials: true,
  });
  const byCode: Record<string, TCountryRegion> = {};
  (body.countryRegionList ?? []).forEach(region => {
    if (region.code) {
      byCode[region.code] = region;
    }
  });
  return byCode;
};
