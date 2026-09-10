import * as http from "@rbx/core-lib/http";
import type { RequestOptions } from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import type { TChatHttpTransport, TChatUrlConfig } from "./chatHttpTransport";

const buildUrl = (config: TChatUrlConfig, params?: object): Url => {
  const url = Url.parse(config.url).getOrThrow();
  if (!params) {
    return url;
  }
  return url.withSearchParams(
    Object.entries(params)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key, String(value)] as const),
  );
};

// Map the legacy UrlConfig flags onto core-lib request options:
// - withCredentials → credentials: "include" (chat calls are cross-subdomain, cookies required)
// - retryable       → retry: defaultBrowserRetryDelay (the www-common retryInterceptor only retries
//                     when a `retry` delay function is present on the request)
// - includeBodyOnError is always set so a non-2xx response's body lands on HttpError.response.body.
//   normalizeError re-inflates it into the `{ errors: [...] }` envelope the chat error classifiers
//   read (e.g. the TextTooLong caption) — parity with the Axios path, where the body always arrived
//   already parsed on `error.response.data`.
const buildOptions = (config: TChatUrlConfig): RequestOptions => ({
  includeBodyOnError: true,
  ...(config.withCredentials ? { credentials: "include" as const } : {}),
  ...(config.retryable ? { retry: http.defaultBrowserRetryDelay } : {}),
  ...(config.noCache
    ? { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" } }
    : {}),
});

/**
 * Axios-shaped rejection. The transport-agnostic chat error classifiers (chatSendFailure.ts and
 * useSendMessage.ts) read `error.response.status` and `error.response.data.errors[0]` — the shape the
 * legacy Axios `httpService` rejects with. Rebuilding that shape here keeps those classifiers
 * backend-agnostic instead of teaching each of them the core-lib HttpError layout.
 */
class ChatHttpTransportError extends Error {
  constructor(
    readonly response: { status: number; data: unknown },
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

/**
 * Re-shape a core-lib HttpError into the Axios-style rejection above. core-lib exposes the non-2xx
 * response body as raw text (via the `includeBodyOnError` option set in buildOptions); we parse it
 * back to JSON so `error.response.data.errors[0].message` (e.g. "TextTooLong") reads exactly as it did
 * on the Axios path. A non-JSON body is passed through verbatim, and non-HttpError rejections
 * (network / abort / interceptor errors) propagate unchanged.
 */
const normalizeError = (error: unknown): Error => {
  if (error instanceof http.HttpError) {
    const { status, body } = error.response;
    let data: unknown = body;
    if (typeof body === "string") {
      try {
        data = JSON.parse(body);
      } catch {
        data = body;
      }
    }
    return new ChatHttpTransportError({ status, data }, error.message, { cause: error });
  }
  return error instanceof Error ? error : new Error(String(error), { cause: error });
};

// The transport intentionally trusts the backend response shape (no Zod schema on this path),
// mirroring the legacy Axios `httpService.get<T>`/`post<T>` which also return `T` unvalidated. The
// double assertion (getOrThrow resolves to core-lib's DeserializedJson) is the accepted seam idiom.
const nextjs: TChatHttpTransport = {
  get: <T>(config: TChatUrlConfig, params?: object): Promise<T> => {
    const body = http.getUntyped(buildUrl(config, params), buildOptions(config)).getOrThrow();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (body as unknown as Promise<T>).catch((error: unknown) => {
      throw normalizeError(error);
    });
  },
  post: <T>(config: TChatUrlConfig, data?: object): Promise<T> => {
    // The seam accepts any `object` body (as the legacy Axios transport did) and trusts it to be
    // JSON-serializable — every chat POST body is a plain object of primitives/arrays.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const payload = (data ?? {}) as JsonSerializable;
    const body = http.postUntyped(buildUrl(config), payload, buildOptions(config)).getOrThrow();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (body as unknown as Promise<T>).catch((error: unknown) => {
      throw normalizeError(error);
    });
  },
};

export default nextjs;
