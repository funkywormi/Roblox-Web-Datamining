import { document } from "@rbx/core-lib/browser";
import { timeout } from "@rbx/core-lib/promise";
import * as http from "@rbx/core-scripts/http";
import type { AxiosPromise, UrlConfig } from "@rbx/core-scripts/http";
import { retryAttemptHeader } from "@rbx/core-scripts/http/util";

type ErrorBody = { Data?: unknown; error?: unknown } | null | undefined;

export class RequestError extends Error {
  readonly body: ErrorBody;

  constructor(body: ErrorBody) {
    super("Request failed");
    this.body = body;
  }
}

const getData = (response: unknown): ErrorBody => {
  if (typeof response !== "object" || response === null || !("data" in response)) {
    return undefined;
  }
  const { data } = response;
  return typeof data === "object" ? data : undefined;
};

const getResponseBody = (error: unknown): ErrorBody =>
  typeof error === "object" && error !== null && "response" in error
    ? getData(error.response)
    : getData(error);

const toRequestError = (error: unknown): Promise<never> =>
  Promise.reject(new RequestError(getResponseBody(error)));

const DEFAULT_RETRY_BASE_TIMEOUT = 1000;
const DEFAULT_RETRY_MAX_TIMEOUT = 8000;
const FORBIDDEN = 403;

const readRetryTimeouts = () => {
  const data = document?.getElementById("http-retry-data")?.dataset;
  return {
    base: Number(data?.httpRetryBaseTimeout) || DEFAULT_RETRY_BASE_TIMEOUT,
    max: Number(data?.httpRetryMaxTimeout) || DEFAULT_RETRY_MAX_TIMEOUT,
  };
};

const isForbidden = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "status" in error && error.status === FORBIDDEN;

const withRetryAttempt = (urlConfig: UrlConfig, retry: number): UrlConfig =>
  retry > 0 && retryAttemptHeader
    ? { ...urlConfig, headers: { ...urlConfig.headers, "x-retry-attempt": String(retry) } }
    : urlConfig;

const sendWithRetries = async <T>(
  send: (urlConfig: UrlConfig) => AxiosPromise<T>,
  urlConfig: UrlConfig,
  retry = 0,
): Promise<T> => {
  try {
    const response = await send(withRetryAttempt(urlConfig, retry));
    return response.data;
  } catch (error) {
    const { base, max } = readRetryTimeouts();
    const delay = base * 2 ** retry;
    if (!urlConfig.retryable || isForbidden(error) || delay > max) {
      throw error;
    }
    await timeout(delay);
    return sendWithRetries(send, urlConfig, retry + 1);
  }
};

export const getJson = <T>(
  urlConfig: Omit<UrlConfig, "withCredentials">,
  params?: Record<string, unknown>,
): Promise<T> =>
  sendWithRetries(config => http.get<T>(config, params), {
    ...urlConfig,
    withCredentials: true,
  }).catch(toRequestError);

export const postJson = <T>(
  urlConfig: Omit<UrlConfig, "withCredentials">,
  data?: object,
): Promise<T> =>
  sendWithRetries(config => http.post<T>(config, data), {
    ...urlConfig,
    withCredentials: true,
  }).catch(toRequestError);

const getBody = (error: unknown): ErrorBody =>
  error instanceof RequestError ? error.body : undefined;

export class PageLoadError extends Error {
  readonly reason: unknown;

  constructor(reason: unknown) {
    super("Page load failed");
    this.reason = reason;
  }
}

const firstTruthy = (...values: unknown[]): unknown => values.find(Boolean) ?? "";

export const rejectWithDataOrError = (error: unknown): Promise<never> => {
  const body = getBody(error);
  return Promise.reject(new PageLoadError(firstTruthy(body?.Data, body?.error)));
};

export const rejectWithError = (error: unknown): Promise<never> =>
  Promise.reject(new PageLoadError(firstTruthy(getBody(error)?.error)));
