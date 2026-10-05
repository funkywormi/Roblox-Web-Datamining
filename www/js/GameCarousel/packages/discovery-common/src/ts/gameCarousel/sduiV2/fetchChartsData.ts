import {
  asNonEmptyString,
  type ApiRequestConfig,
  type SduiApiResponse,
  type SduiApiResponseAs,
} from "@rbx/sdui-core";
import getDeviceFeatures, { type TDeviceFeatures } from "../../common/utils/deviceFeaturesUtils";
import {
  buildChartsPageRequestUrl,
  buildChartsSortDetailRequestUrl,
  chartsSduiV2Config,
  getChartsPageKey,
  getChartsPageSurfaceKey,
  getChartsSortDetailPageKey,
  getChartsSortDetailSurfaceKey,
  type ChartsPageRequestParams,
  type ChartsRequestFilters,
} from "./chartsPageConfiguration";

type ChartsSortDetailExtras = { nextContentPageToken?: string };

export type ChartsPageRequestConfigOptions = Pick<
  ChartsPageRequestParams,
  "pageType" | "includePlaceholders"
> & {
  deviceFeatures?: TDeviceFeatures;
};

const getChartsFeedNextPageToken = (response: SduiApiResponse): string | undefined => {
  const chartsFeedEntry = response.pageEntries.find(
    ({ inputDataType }) => inputDataType === "chartsFeed",
  );
  return asNonEmptyString(chartsFeedEntry?.inputData.nextPageToken);
};

/** Builds the `ApiRequestConfig` for the main Charts page feed. */
export function buildChartsPageRequestConfig(
  sessionId: string,
  filters?: ChartsRequestFilters,
  options?: ChartsPageRequestConfigOptions,
): ApiRequestConfig {
  const { responseFormat, pageProtoSchema } = chartsSduiV2Config;
  const requestParams: ChartsPageRequestParams = {
    sessionId,
    filters,
    pageType: options?.pageType,
    deviceFeatures: options?.deviceFeatures ?? getDeviceFeatures(),
    includePlaceholders: options?.includePlaceholders,
  };
  const buildUrl = (feedPageToken?: string) =>
    buildChartsPageRequestUrl({ ...requestParams, feedPageToken });

  return {
    url: buildUrl(),
    surfaceKey: getChartsPageSurfaceKey(),
    configKey: getChartsPageKey(),
    responseFormat,
    protoSchema: pageProtoSchema,
    buildRefreshUrl: () => buildUrl(),
    buildNextPageUrl: previousResponse => {
      const feedPageToken = getChartsFeedNextPageToken(previousResponse);
      return feedPageToken ? buildUrl(feedPageToken) : undefined;
    },
  };
}

export function buildChartsSortDetailRequestConfig(
  sortId: string,
  sessionId: string,
  filters?: ChartsRequestFilters,
): ApiRequestConfig {
  const { responseFormat, sortDetailProtoSchema } = chartsSduiV2Config;
  const deviceFeatures = getDeviceFeatures();
  const buildUrl = (contentPageToken?: string) =>
    buildChartsSortDetailRequestUrl(sortId, sessionId, contentPageToken, filters, deviceFeatures);

  return {
    url: buildUrl(),
    surfaceKey: getChartsSortDetailSurfaceKey(),
    configKey: getChartsSortDetailPageKey(sortId),
    responseFormat,
    protoSchema: sortDetailProtoSchema,
    buildRefreshUrl: () => buildUrl(),
    buildNextPageUrl: previousResponse => {
      const { nextContentPageToken } =
        previousResponse as SduiApiResponseAs<ChartsSortDetailExtras>;
      return nextContentPageToken ? buildUrl(nextContentPageToken) : undefined;
    },
  };
}
