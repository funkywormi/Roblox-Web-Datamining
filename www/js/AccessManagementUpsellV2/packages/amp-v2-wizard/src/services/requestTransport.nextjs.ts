import { window } from "@rbx/core-lib/browser";
import * as http from "@rbx/core-lib/http";
import type { RequestOptions } from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import type { RequestConfig, RequestTransport } from "./requestTransport";

/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */

const toParam = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : JSON.stringify(value);

const buildUrl = (config: RequestConfig, params?: object): Url => {
  const url = Url.parse(new URL(config.url, window?.location.origin).href).getOrThrow();
  if (!params) {
    return url;
  }
  return url.withSearchParams(
    Object.entries(params).flatMap(([key, value]: [string, unknown]) =>
      value == null ? [] : [[key, toParam(value)] as const],
    ),
  );
};

const buildOptions = (config: RequestConfig): RequestOptions => ({
  includeBodyOnError: true,
  ...(config.withCredentials ? { credentials: "include" as const } : {}),
  ...(config.headers ? { headers: config.headers } : {}),
  ...(config.retryable ? { retry: http.defaultBrowserRetryDelay } : {}),
});

/** Carries `status` and `data` at the top level, the shape the axios interceptor rejects with. */
export class RequestTransportError extends Error {
  constructor(
    readonly status: number,
    readonly data: unknown,
    options?: ErrorOptions,
  ) {
    super(`Request failed with status ${status}`, options);
  }
}

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
    return new RequestTransportError(status, data, { cause: error });
  }
  return error instanceof Error ? error : new Error(String(error), { cause: error });
};

const toResponse = <T>(body: Promise<unknown>): Promise<{ data: T }> =>
  body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    .then(data => ({ data: data as T }))
    .catch((error: unknown) => {
      throw normalizeError(error);
    });

const nextjs: RequestTransport = {
  get: <T>(config: RequestConfig, params?: object) =>
    toResponse<T>(
      Promise.resolve().then(() =>
        http.getUntyped(buildUrl(config, params), buildOptions(config)).getOrThrow(),
      ),
    ),
  post: <T>(config: RequestConfig, data?: object) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const payload = (data ?? {}) as JsonSerializable;
    return toResponse<T>(
      Promise.resolve().then(() =>
        http.postUntyped(buildUrl(config), payload, buildOptions(config)).getOrThrow(),
      ),
    );
  },
};

export default nextjs;
