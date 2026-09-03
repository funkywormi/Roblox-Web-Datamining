/* eslint-disable no-restricted-syntax */
import environmentUrls from "@rbx/environment-urls";
import { get } from "../http";

const BEHAVIOR_PATTERN = "<behaviour-name>";

const getGuacUrl = (behaviorName: string, params?: URLSearchParams): string => {
  const { apiGatewayUrl } = environmentUrls;
  const rawPath = "/guac-v2/v1/bundles/<behaviour-name>";
  const resolvedPath = rawPath.replace(BEHAVIOR_PATTERN, behaviorName);

  const search = params?.toString() ?? "";
  return `${apiGatewayUrl}${resolvedPath}${search === "" ? "" : `?${search}`}`;
};

export const callBehaviour = async <T>(
  behaviorName: string,
  params?: URLSearchParams,
): Promise<T> => {
  const guacUrl = getGuacUrl(behaviorName, params);
  const response = await get<T>({ url: guacUrl, withCredentials: true });
  return response.data;
};
