import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { RawConfig } from "../hooks/abuseSheetFlow/types";

/**
 * Fetch the config object that describes the abuse report UI
 */
const fetchConfig = async (
  targetId: string,
  abuseVector: string,
  locale: string,
): Promise<RawConfig> => {
  const params = new URLSearchParams({
    abuseVector,
    targetId,
    locale,
    entryPoint: "web",
    version: "2",
  });

  const response = await httpService.get<RawConfig>({
    url: `${EnvironmentUrls.apiGatewayUrl}/abuse-reporting/v1/dynamic-config?${params.toString()}`,
    withCredentials: true,
  });
  const { data } = response;

  return data;
};

/**
 * How long we cache the latest config object for
 */
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

let cache: {
  key: string;
  promise: Promise<RawConfig>;
  data?: RawConfig;
  timeoutId: ReturnType<typeof setTimeout>;
} | null = null;

/**
 * Clear cache. Used for testing.
 */
export const clearCache = (): void => {
  if (cache) {
    clearTimeout(cache.timeoutId);
    cache = null;
  }
};

/**
 * Cached config fetching. Caches only the last request (keyed by targetId, abuseVector, locale).
 * Errors are not cached.
 */
export const fetchCachedConfig = (
  targetId: string,
  abuseVector: string,
  locale: string,
): Promise<RawConfig> => {
  const key = JSON.stringify({ targetId, abuseVector, locale });

  if (cache && cache.key === key) {
    return cache.promise;
  }

  if (cache) {
    clearTimeout(cache.timeoutId);
  }

  const promise = fetchConfig(targetId, abuseVector, locale)
    .then(data => {
      if (cache && cache.key === key) {
        cache.data = data;
      }
      return data;
    })
    .catch((error: unknown) => {
      // don't cache errors
      clearCache();
      throw error;
    });

  const timeoutId = setTimeout(() => {
    if (cache && cache.key === key) {
      cache = null;
    }
  }, CACHE_TTL_MS);

  cache = {
    key,
    promise,
    timeoutId,
  };

  return promise;
};

export default fetchConfig;
