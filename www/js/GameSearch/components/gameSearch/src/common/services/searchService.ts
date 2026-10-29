import { create, toJson } from "@bufbuild/protobuf";
import { Url } from "@rbx/core-lib/url";
import environmentUrls from "@rbx/environment-urls";
import {
  ClientCapabilitiesSchema,
  GetSearchResultsPageResponseSchema,
  Platform,
  streamingFeedMergeStrategy,
  type ApiRequestConfig,
  type ClientCapabilities,
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

export const buildSearchApiRequestUrl = (): Url => {
  const url = `${apiGatewayUrl}${SEARCH_API_RESULTS_PAGE_STREAM_PATH}`;

  return Url.parse(url).getOrThrow();
};

export type SearchApiClientCapabilities = Partial<
  Pick<
    ClientCapabilities,
    | "enabledCapabilities"
    | "protoVersion"
    | "registeredUiComponentTypes"
    | "registeredActionTypes"
    | "runtimeFlagValues"
  >
>;

export type SearchApiRequestConfigParams = SearchApiRequestParams & {
  surfaceKey: string;
  configKey: string;
  /** Advertise a feature only once this web client implements its full contract. */
  clientCapabilities?: SearchApiClientCapabilities;
};

export function buildSearchApiRequestConfig({
  keyword,
  sessionId,
  surfaceKey,
  configKey,
  clientCapabilities,
}: SearchApiRequestConfigParams): ApiRequestConfig {
  const body = JSON.stringify({
    searchQuery: keyword,
    globalSessionId: sessionId,
    verticalType: SearchApiVerticalType.BLENDED,
    clientCapabilities: toJson(
      ClientCapabilitiesSchema,
      create(ClientCapabilitiesSchema, {
        ...clientCapabilities,
        platform: Platform.WEB,
      }),
    ),
  });

  return {
    url: buildSearchApiRequestUrl(),
    surfaceKey,
    configKey,
    postConfig: {
      body,
      contentType: "application/json",
      // Query and capability changes must not reuse a different POST's cached response.
      bodyKey: body,
    },
    enableStreaming: true,
    mergeStrategy: streamingFeedMergeStrategy,
    responseFormat: SEARCH_API_RESPONSE_FORMAT,
    protoSchema: SEARCH_API_PAGE_PROTO_SCHEMA,
    buildRefreshUrl: buildSearchApiRequestUrl,
  };
}
