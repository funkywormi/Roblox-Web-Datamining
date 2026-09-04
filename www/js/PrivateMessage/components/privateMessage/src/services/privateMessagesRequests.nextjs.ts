import * as http from "@rbx/core-lib/http";
import type { RequestOptions } from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import environmentUrls from "@rbx/environment-urls";
import type {
  MessageBody,
  MessageUrlConfig,
  PrivateMessagesTransport,
} from "./privateMessagesRequests";

// Next.js transport, using @rbx/core-lib/http. CSRF, auth, locale, and Sentry are wired globally by
// www-common setClientInterceptors() (called in www-nextjs instrumentation-client before any
// component runs), so calls need no manual wiring. guac bundles are fetched off the api gateway
// since core-scripts callBehaviour is .NET-only.

// core-lib HttpError.message leaks the endpoint ("500 GET https://..."). getErrorMessage reads
// `.message`, so surface the generic status string the Axios path produced. Others pass through.
const normalizeError = (error: unknown): Error => {
  if (error instanceof http.HttpError) {
    return new Error(`Request failed with status code ${error.response.status}`, { cause: error });
  }
  return error instanceof Error ? error : new Error(String(error), { cause: error });
};

// Untyped fetch resolves to DeserializedJson; callers pass the concrete T (validated downstream by
// the normalize* helpers), so assert once here. `defaultEmpty` handles an empty body that post derefs.
const unwrap = <T>(
  result: { getOrThrow: () => Promise<unknown> },
  defaultEmpty = false,
): Promise<T> =>
  result.getOrThrow().then(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- untyped transport boundary
    value => (defaultEmpty && value == null ? {} : value) as T,
    (error: unknown) => {
      throw normalizeError(error);
    },
  );

// Map UrlConfig flags onto core-lib request options: withCredentials → credentials, retryable →
// retry delay (retryInterceptor only retries when a delay is set), noCache → no-cache headers.
const buildOptions = (urlConfig: MessageUrlConfig): RequestOptions => ({
  ...(urlConfig.withCredentials ? { credentials: "include" as const } : {}),
  ...(urlConfig.retryable ? { retry: http.defaultBrowserRetryDelay } : {}),
  ...(urlConfig.noCache
    ? { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" } }
    : {}),
});

const toUrl = (rawUrl: string, params?: object): Url => {
  const url = Url.parse(rawUrl).getOrThrow();
  if (!params) {
    return url;
  }
  const searchParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key, String(value)]),
  );
  return url.withSearchParams(searchParams);
};

const nextjs: PrivateMessagesTransport = {
  get: <T>(urlConfig: MessageUrlConfig, params?: object): Promise<T> =>
    unwrap(http.getUntyped(toUrl(urlConfig.url, params), buildOptions(urlConfig))),

  post: <T>(urlConfig: MessageUrlConfig, body?: MessageBody): Promise<T> =>
    unwrap(http.postUntyped(toUrl(urlConfig.url), body ?? {}, buildOptions(urlConfig)), true),

  getGuacBundle: <T>(bundleName: string): Promise<T> => {
    const url = Url.parse(environmentUrls.apiGatewayUrl)
      .getOrThrow()
      // eslint-disable-next-line no-restricted-syntax -- Next.js can't use core-scripts callBehaviour; fetch the bundle off the gateway
      .withPath(`/guac-v2/v1/bundles/${bundleName}`)
      .withSearchParams({ version: "1" });
    return unwrap(http.getUntyped(url, { credentials: "include" }));
  },
};

export default nextjs;
