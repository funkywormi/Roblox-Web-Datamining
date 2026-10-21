import { Url } from "@rbx/core-lib/url";
import environmentUrls from "@rbx/environment-urls";
import {
  GetSearchResultsPageResponseSchema,
  type ApiRequestConfig,
  streamingFeedMergeStrategy,
} from "@rbx/sdui-core";

const { apiGatewayUrl } = environmentUrls;

export const SearchApiVerticalType = {
  BLENDED: "blended",
} as const;

const SEARCH_API_RESULTS_PAGE_STREAM_PATH = "/search-api/v1/search-results-page-stream";

const SEARCH_API_PAGE_PROTO_SCHEMA = GetSearchResultsPageResponseSchema;

const SEARCH_API_RESPONSE_FORMAT = "protobuf" as const;

export type SearchApiRequestParams = {
  keyword: string;
  sessionId: string;
};

export const buildSearchApiRequestUrl = ({ keyword, sessionId }: SearchApiRequestParams): Url => {
  const url = `${apiGatewayUrl}${SEARCH_API_RESULTS_PAGE_STREAM_PATH}`;

  return Url.parse(url).getOrThrow().withSearchParams({
    searchQuery: keyword,
    globalSessionId: sessionId,
    verticalType: SearchApiVerticalType.BLENDED,
  });
};

export type SearchApiRequestConfigParams = SearchApiRequestParams & {
  surfaceKey: string;
  configKey: string;
};

export function buildSearchApiRequestConfig({
  keyword,
  sessionId,
  surfaceKey,
  configKey,
}: SearchApiRequestConfigParams): ApiRequestConfig {
  const buildUrl = () => buildSearchApiRequestUrl({ keyword, sessionId });

  return {
    url: buildUrl(),
    surfaceKey,
    configKey,
    enableStreaming: true,
    mergeStrategy: streamingFeedMergeStrategy,
    responseFormat: SEARCH_API_RESPONSE_FORMAT,
    protoSchema: SEARCH_API_PAGE_PROTO_SCHEMA,
    buildRefreshUrl: () => buildUrl(),
  };
}
