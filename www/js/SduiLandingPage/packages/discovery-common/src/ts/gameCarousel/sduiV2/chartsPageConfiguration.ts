import { Url } from "@rbx/core-lib/url";
import { GetChartsPageResponseSchema, GetChartsSortDetailResponseSchema } from "@rbx/sdui-core";
import bedev2Constants from "../../common/constants/bedev2Constants";
import getDeviceFeatures, { type TDeviceFeatures } from "../../common/utils/deviceFeaturesUtils";
import { PageContext } from "../../common/types/pageContext";

// SDUI analytics `appPage` / `context`.
export const CHARTS_APP_PAGE = PageContext.GamesPage;

// surface keys are distinct for charts and see all page so ApiStore
// scopes and page-services singletons do not share
export const getChartsPageSurfaceKey = (): string => PageContext.GamesPage;
export const getChartsSortDetailSurfaceKey = (): string => "ChartsSortDetail";

// TODO (sshetty): Change to protobuf on dev complete.
const CHARTS_RESPONSE_FORMAT = "protobuf" as const;

// SduiApiStore cache key for the main Charts page feed. Matches Lua
// `ChartsConstants.ConfigKey` and the template `LOAD_MORE_FROM_API` `configKey`.
export const getChartsPageKey = (): string => "ChartsPage";

// Must stay byte-identical to the sort-detail template's `LOAD_MORE_FROM_API`
// `configKey` format (`ChartsSortDetail-{sortId}`) — that action param is what
// resolves the store key for see-all pagination.
export const getChartsSortDetailPageKey = (sortId: string): string => `ChartsSortDetail-${sortId}`;

// Page-entry identifiers selected by SduiPageEntryPoint.
export const CHARTS_FEED_IDENTIFIER = "charts_feed";
export const SORT_DETAIL_FEED_IDENTIFIER = "sort_detail_feed";

// charts-api expects universal page entries; the SDUI client decodes the
// universal shape.
const PAGE_ENTRY_FORMAT = "Universal";

// charts-api cohort/filter selections inherited from the charts feed via URL
// query params. charts-api reads `device`/`country`/`ageGroup` to pick the
// pre-ranked content set + rerank, and `audience` (`all` | `kids` | `select`)
// to restrict game sorts to a Kids/Select corpus. Empty or omitted audience
// means all.
export type ChartsRequestFilters = {
  device?: string;
  country?: string;
  ageGroup?: string;
  audience?: string;
};

export const CHARTS_FILTER_KEYS = ["device", "country", "ageGroup", "audience"] as const;

export type ChartsPageRequestParams = {
  sessionId: string;
  filters?: ChartsRequestFilters;
  feedPageToken?: string;
  pageType?: string;
  deviceFeatures: TDeviceFeatures;
  includePlaceholders?: boolean;
};

const normalizeOptionalString = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }
  return normalized;
};

export const normalizeChartsFilters = (
  filters: ChartsRequestFilters | undefined,
): ChartsRequestFilters | undefined => {
  if (!filters) {
    return undefined;
  }

  const device = normalizeOptionalString(filters.device);
  const country = normalizeOptionalString(filters.country);
  const ageGroup = normalizeOptionalString(filters.ageGroup);
  const audience = normalizeOptionalString(filters.audience);
  if (!device && !country && !ageGroup && !audience) {
    return undefined;
  }
  return { device, country, ageGroup, audience };
};

export const parseChartsFiltersFromSearch = (search: string): ChartsRequestFilters => {
  const params = new URLSearchParams(search);
  const filters: ChartsRequestFilters = {
    device: params.get("device") ?? undefined,
    country: params.get("country") ?? undefined,
    ageGroup: params.get("ageGroup") ?? undefined,
    audience: params.get("audience") ?? undefined,
  };

  return normalizeChartsFilters(filters) ?? {};
};

const normalizeDeviceFeatures = (deviceFeatures: TDeviceFeatures): TDeviceFeatures => ({
  cpuCores: deviceFeatures.cpuCores,
  maxMemory: deviceFeatures.maxMemory,
  maxResolution: normalizeOptionalString(deviceFeatures.maxResolution),
  networkType: normalizeOptionalString(deviceFeatures.networkType),
});

// Device features drive the charts-api device cohort (high_end/low_end/all) and
// the cohort-CCU rerank.
const buildDeviceFeatureSearchParams = (
  deviceFeatures: TDeviceFeatures,
): Record<string, string> => ({
  ...(deviceFeatures.cpuCores !== undefined ? { cpuCores: `${deviceFeatures.cpuCores}` } : {}),
  ...(deviceFeatures.maxMemory !== undefined ? { maxMemory: `${deviceFeatures.maxMemory}` } : {}),
  ...(deviceFeatures.maxResolution ? { maxResolution: deviceFeatures.maxResolution } : {}),
  ...(deviceFeatures.networkType ? { networkType: deviceFeatures.networkType } : {}),
});

export const buildSearchParamsFromFilters = (
  filters?: ChartsRequestFilters,
): Record<string, string> => ({
  ...(filters?.device ? { device: filters.device } : {}),
  ...(filters?.country ? { country: filters.country } : {}),
  ...(filters?.ageGroup ? { ageGroup: filters.ageGroup } : {}),
  ...(filters?.audience ? { audience: filters.audience } : {}),
});

export const serializeChartsFiltersToSearch = (
  filters: ChartsRequestFilters | undefined,
  baseSearch = "",
): string => {
  const params = new URLSearchParams(baseSearch);
  CHARTS_FILTER_KEYS.forEach(key => params.delete(key));
  Object.entries(buildSearchParamsFromFilters(normalizeChartsFilters(filters))).forEach(
    ([key, value]) => {
      params.set(key, value);
    },
  );
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

export const getChartsFilterResetKeyFromSearch = (search: string): string =>
  serializeChartsFiltersToSearch(parseChartsFiltersFromSearch(search));

export const getChartsFilterQueryParamsFromSearch = (search: string): Record<string, string> =>
  buildSearchParamsFromFilters(parseChartsFiltersFromSearch(search));

export const buildChartsPageRequestUrl = (params: ChartsPageRequestParams): Url => {
  const sessionId = params.sessionId;
  const filters = normalizeChartsFilters(params.filters);
  const pageType = normalizeOptionalString(params.pageType);
  const deviceFeatures = normalizeDeviceFeatures(params.deviceFeatures);
  const feedPageToken = normalizeOptionalString(params.feedPageToken);
  const { url } = bedev2Constants.url.getChartsPage();

  return Url.parse(url)
    .getOrThrow()
    .withSearchParams({
      PageEntryFormat: PAGE_ENTRY_FORMAT,
      ...buildDeviceFeatureSearchParams(deviceFeatures),
      ...buildSearchParamsFromFilters(filters),
      sessionId,
      ...(feedPageToken ? { feedPageToken } : {}),
      ...(pageType ? { pageType } : {}),
      ...(params.includePlaceholders ? { includePlaceholders: "true" } : {}),
    });
};

export const buildChartsSortDetailRequestUrl = (
  sortId: string,
  sessionId: string,
  contentPageToken?: string,
  filters?: ChartsRequestFilters,
  deviceFeatures: TDeviceFeatures = getDeviceFeatures(),
): Url => {
  const normalizedFilters = normalizeChartsFilters(filters);
  const normalizedDeviceFeatures = normalizeDeviceFeatures(deviceFeatures);
  const normalizedContentPageToken = normalizeOptionalString(contentPageToken);
  const { url } = bedev2Constants.url.getChartsSortDetail();

  return Url.parse(url)
    .getOrThrow()
    .withSearchParams({
      sortId,
      PageEntryFormat: PAGE_ENTRY_FORMAT,
      ...buildDeviceFeatureSearchParams(normalizedDeviceFeatures),
      ...buildSearchParamsFromFilters(normalizedFilters),
      sessionId,
      ...(normalizedContentPageToken ? { contentPageToken: normalizedContentPageToken } : {}),
    });
};

/**
 * Charts SDUI v2 configuration used by `fetchChartsData` to build
 * `ApiRequestConfig`s. Exposes the per-endpoint response schemas used to
 * decode protobuf in `SduiApiStore`. Entry-point identifiers live on the
 * containers (`SduiPageEntryPoint.identifiers`), not here.
 */
export const chartsSduiV2Config = {
  appPage: CHARTS_APP_PAGE,
  responseFormat: CHARTS_RESPONSE_FORMAT,
  pageProtoSchema: GetChartsPageResponseSchema,
  sortDetailProtoSchema: GetChartsSortDetailResponseSchema,
};

export default chartsSduiV2Config;
