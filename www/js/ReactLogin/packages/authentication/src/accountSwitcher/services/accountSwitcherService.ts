import { EnvironmentUrls } from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import {
  TSwitchParams,
  TSwitchResponse,
  TGetLoggedInUsersMetadataRequestParams,
  TGetLoggedInUsersMetadataResponse,
  TLogoutAllLoggedInUsersRequestParams,
} from "@rbx/authentication-common/types/accountSwitcherTypes";

// CSRF and bound-auth headers come from the host's setClientInterceptors (coreUtilities on .NET,
// instrumentation-client on Next.js). Built per call so importing never parses EnvironmentUrls.
const getApiGatewayUrl = (path: string): Url =>
  Url.parse(EnvironmentUrls.apiGatewayUrl).getOrThrow().withPath(path);

// Responses are cast, not schema-validated, to match the previous Axios behavior: callers already
// guard optional fields, and a strict schema would turn today's partial responses into failures.
const postForJson = async <T>(path: string, params: JsonSerializable): Promise<T> => {
  const result = await http.postUntyped(getApiGatewayUrl(path), params, {
    credentials: "include",
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return result.getOrThrow() as T;
};

export const getLoggedInUsersMetadata = (
  params: TGetLoggedInUsersMetadataRequestParams,
): Promise<TGetLoggedInUsersMetadataResponse> =>
  postForJson("/account-switcher/v1/getLoggedInUsersMetadata", params);

export const switchAccount = (params: TSwitchParams): Promise<TSwitchResponse> =>
  postForJson("/account-switcher/v1/switch", params);

export const logoutAllLoggedInUsers = async (
  params: TLogoutAllLoggedInUsersRequestParams,
): Promise<void> => {
  await postForJson("/account-switcher/v1/logoutAllLoggedInUsers", params);
};
