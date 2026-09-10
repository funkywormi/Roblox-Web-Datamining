import type { ZodMiniType } from "zod/mini";
import { abortErrorFromError } from "../abort";
import { DeserializedJson, JsonDeserializationError, JsonSerializable, serialize } from "../json";
import { AsyncResult, err, errAsync, ok, okAsync } from "../result";
import type { Url } from "../url";
import type { InternalUrl } from "../url/internal";
import { Mutable } from "../commonTypes";
import { zodSafeParse } from "../zod";
import {
  FetchError,
  FetchFunction,
  FetchJsonError,
  FetchOptions,
  HttpError,
  HttpInterceptor,
  PostJsonError,
  RequestInfo,
  RequestOptions,
  RetryDelayFunction,
  UnknownFetchError,
} from "./types";
import {
  defaultRetryableHttpStatuses,
  exponentialBackoff,
  isRetryableError,
  retryAfterHeaderDelay,
  retryInterceptor,
} from "./retry";

/**
 * The default {@link RetryDelayFunction}. For most uses cases, this should be sufficient.
 *
 * The retry delay, in milliseconds, is determined by exponential backoff starting at {@link factor} up to a
 * maximum of {@link maxDelay}. I.e., `min(2 ** n * factor, maxDelay)`.
 *
 * Only certain HTTP status codes as defined by {@link retryableHttpStatuses} (see {@link defaultRetryableHttpStatuses})
 * and {@link UnknownFetchError}s are retried. Other HTTP status codes and `AbortError`s will not be retried.
 */
export const defaultRetryDelay = ({
  maxRetries,
  factor,
  maxDelay,
  retryableHttpStatuses = defaultRetryableHttpStatuses,
}: {
  readonly maxRetries: number;
  readonly factor: number;
  readonly maxDelay: number;
  readonly retryableHttpStatuses?: readonly number[];
}): RetryDelayFunction => {
  const backoff = exponentialBackoff(factor, maxDelay);
  return (failedRetries: number, error: FetchError) =>
    failedRetries < maxRetries && isRetryableError(error, retryableHttpStatuses)
      ? (retryAfterHeaderDelay(error) ?? backoff(failedRetries))
      : NaN;
};

/**
 * The default {@link RetryDelayFunction} for fetches in the browser.
 *
 * See {@link defaultRetryDelay} for more information.
 */
export const defaultBrowserRetryDelay = defaultRetryDelay({
  maxRetries: 3,
  factor: 1_000,
  maxDelay: 30_000,
});

const fetchWithoutInterceptors: FetchFunction = (
  url: Url | InternalUrl,
  options: Mutable<RequestInfo>,
): AsyncResult<Response, FetchError> =>
  AsyncResult.fromPromise(
    globalThis.fetch(url.href, options),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    e => abortErrorFromError(e) ?? new UnknownFetchError(e as Error),
  ).andThen(response => {
    if (response.ok) {
      return ok(response);
    }
    if (options.includeBodyOnError) {
      return response
        .text()
        .catch(() => undefined)
        .then(body => err(HttpError.new(url, options, response, body)));
    }
    return err(HttpError.new(url, options, response));
  });

let fetchWithInterceptors: FetchFunction = retryInterceptor(fetchWithoutInterceptors);

/**
 * Set the interceptors to use for all fetch requests.
 *
 * Incoming requests are chained through all {@link interceptors}.
 *
 * In the "forward pass", each interceptor has the opportunity to modify the request before passing
 * it to the next interceptor in the array. Some interceptors may choose to return a response early,
 * bypassing the remaining interceptors.
 *
 * Eventually, a response is returned up the stack to all the previously called interceptors.
 * In this "backward pass", each interceptor has the opportunity to modify the response.
 *
 * E.g., an interceptor might follow this flow:
 * ```
 * next => (url, options) => {
 *   // modify url or options
 *   const response = next(url, options);
 *   // modify response
 *   return response;
 * }
 * ```
 *
 * By default, the {@link retryInterceptor} is used. If setting new interceptors, make sure to include the {@link retryInterceptor}.
 */
export const setInterceptors = (interceptors: readonly HttpInterceptor[]): void => {
  fetchWithInterceptors = interceptors
    .toReversed()
    .reduce((chain, interceptor) => interceptor(chain), fetchWithoutInterceptors);
};

/**
 * Fetch a resource from the network.
 *
 * This is a wrapper around the global [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) function with the following differences:
 * - This method does not throw and instead returns an {@link AsyncResult}.
 * - The error value has several cases ({@link HttpError}, `AbortError`) that you can check for easily.
 * - Registered interceptors are run (see {@link setInterceptors}).
 *
 * ```
 * import { Url } from "@rbx/core-lib";
 * import { HttpError, AbortError } from "@rbx/core-lib/http";
 * import * as http from "@rbx/core-lib/http";
 *
 * const url = Url.parse("https://www.mysite.com").getOrThrow();
 * const result = await http.fetch(url.withPath("/my-route"), {
 *   credentials: "include",
 *   signal: AbortSignal.timeout(10_000),
 * });
 * if (result.isOk()) {
 *   // result.value
 * } else if (result.error instanceof HttpError) {
 *   // result.error.response.status
 * } else if (result.error instanceof AbortError) {
 *   // ignore
 * } else {
 *   // result.error
 * }
 * ```
 */
export const fetch = (
  url: Url | InternalUrl,
  options: FetchOptions = {},
): AsyncResult<Response, FetchError> => {
  const method = options.method ?? "GET";
  const headers = new Headers(options.headers);
  return fetchWithInterceptors(url, { ...options, method, headers });
};

const fromJson = (response: Response) =>
  AsyncResult.fromPromise(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    response.json() as unknown as Promise<DeserializedJson>,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    e => new JsonDeserializationError({ code: "Syntax", error: e as Error }),
  );

const fromSchema =
  <T>(schema: ZodMiniType<T>) =>
  (response: Response) =>
    fromJson(response).andThen(value =>
      zodSafeParse(schema, value).mapErr(
        error => new JsonDeserializationError({ code: "Validation", error }),
      ),
    );

const isJson = (response: Response) => {
  const contentType = response.headers.get("content-type");
  return contentType === "application/json" || contentType?.startsWith("application/json;");
};

/**
 * Perform a HTTP GET for arbitrary JSON data.
 *
 * This is a wrapper around the global [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) function with the following differences:
 * - This method does not throw and instead returns an {@link AsyncResult}.
 * - The error value has several cases ({@link HttpError}, `AbortError`) that you can check for easily.
 * - Registered interceptors are run (see {@link setInterceptors}).
 * - Deserializes the response body JSON (as {@link DeserializedJson}).
 *
 * See also {@link get} which returns a typed value instead of an arbitrary {@link DeserializedJson} value.
 *
 * ```
 * import { Url } from "@rbx/core-lib";
 * import { HttpError, AbortError } from "@rbx/core-lib/http";
 * import * as http from "@rbx/core-lib/http";
 *
 * const url = Url.parse("https://www.mysite.com").getOrThrow();
 * const result = await http.getUntyped(url.withPath("/my-route"), {
 *   credentials: "include",
 *   signal: AbortSignal.timeout(10_000),
 * });
 * if (result.isOk()) {
 *   // result.value
 * } else if (result.error instanceof HttpError) {
 *   // result.error.response.status
 * } else if (result.error instanceof AbortError) {
 *   // ignore
 * } else {
 *   // result.error
 * }
 * ```
 */
export const getUntyped = (
  url: Url | InternalUrl,
  options?: RequestOptions,
): AsyncResult<DeserializedJson, FetchJsonError> => fetch(url, options).andThen(fromJson);

/**
 * Perform a HTTP GET for JSON data matching a zod {@link schema}.
 *
 * This is a wrapper around the global [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) function with the following differences:
 * - This method does not throw and instead returns an {@link AsyncResult}.
 * - The error value has several cases ({@link HttpError}, `AbortError`) that you can check for easily.
 * - Registered interceptors are run (see {@link setInterceptors}).
 * - Deserializes the response body JSON and validates the resulting value using the provided {@link schema}.
 *
 * ```
 * import * as z from "zod/mini";
 * import { Url } from "@rbx/core-lib";
 * import { HttpError, AbortError } from "@rbx/core-lib/http";
 * import * as http from "@rbx/core-lib/http";
 *
 * const schema = z.object({
 *   data: z.array(z.number()),
 * });
 *
 * const url = Url.parse("https://www.mysite.com").getOrThrow();
 * const result = await http.get(url.withPath("/my-route"), schema, {
 *   credentials: "include",
 *   signal: AbortSignal.timeout(10_000),
 * });
 * if (result.isOk()) {
 *   // result.value.data
 * } else if (result.error instanceof HttpError) {
 *   // result.error.response.status
 * } else if (result.error instanceof AbortError) {
 *   // ignore
 * } else {
 *   // result.error
 * }
 * ```
 */
export const get = <T>(
  url: Url | InternalUrl,
  schema: ZodMiniType<T>,
  options?: RequestOptions,
): AsyncResult<T, FetchJsonError<T>> => fetch(url, options).andThen(fromSchema(schema));

const postResponse = (
  url: Url | InternalUrl,
  data: JsonSerializable,
  options?: RequestOptions,
): AsyncResult<Response, PostJsonError> => {
  const body = serialize(data);
  if (body.isErr()) {
    return errAsync(body.error);
  }
  const headers = new Headers(options?.headers);
  headers.set("content-type", "application/json");
  return fetch(url, {
    ...options,
    method: "POST",
    headers,
    body: body.value,
  });
};

/**
 * Perform a HTTP POST for arbitrary JSON data.
 *
 * This is a wrapper around the global [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) function with the following differences:
 * - This method does not throw and instead returns an {@link AsyncResult}.
 * - The error value has several cases ({@link HttpError}, `AbortError`) that you can check for easily.
 * - Registered interceptors are run (see {@link setInterceptors}).
 * - If the response's content type header is `application/json`, then this will deserialize the response body JSON
 *   (as {@link DeserializedJson}). Otherwise, this will return `undefined`.
 *
 * See also {@link post} which returns a typed value instead of an arbitrary {@link DeserializedJson} value.
 *
 * ```
 * import { Url } from "@rbx/core-lib";
 * import { HttpError, AbortError } from "@rbx/core-lib/http";
 * import * as http from "@rbx/core-lib/http";
 *
 * const url = Url.parse("https://www.mysite.com").getOrThrow();
 * const result = await http.postUntyped(
 *   url.withPath("/my-route"),
 *   { data: "foo" },
 *   {
 *     credentials: "include",
 *     signal: AbortSignal.timeout(10_000),
 *   },
 * );
 * if (result.isOk()) {
 *   // result.value
 * } else if (result.error instanceof HttpError) {
 *   // result.error.response.status
 * } else if (result.error instanceof AbortError) {
 *   // ignore
 * } else {
 *   // result.error
 * }
 * ```
 */
export const postUntyped = (
  url: Url | InternalUrl,
  data: JsonSerializable,
  options?: RequestOptions,
): AsyncResult<DeserializedJson | undefined, PostJsonError> =>
  postResponse(url, data, options).andThen(response =>
    isJson(response) ? fromJson(response) : okAsync(undefined),
  );

/**
 * Perform a HTTP POST for JSON data matching a zod {@link schema}.
 *
 * This is a wrapper around the global [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) function with the following differences:
 * - This method does not throw and instead returns an {@link AsyncResult}.
 * - The error value has several cases ({@link HttpError}, `AbortError`) that you can check for easily.
 * - Registered interceptors are run (see {@link setInterceptors}).
 * - Deserializes the response body JSON and validates the resulting value using the provided {@link schema}.
 *
 * To perform a HTTP POST that does not return any data, use {@link postUntyped}.
 * ```
 * import * as z from "zod/mini";
 * import { Url } from "@rbx/core-lib";
 * import { HttpError, AbortError } from "@rbx/core-lib/http";
 * import * as http from "@rbx/core-lib/http";
 *
 * const schema = z.object({
 *   data: z.array(z.number()),
 * });
 *
 * const url = Url.parse("https://www.mysite.com").getOrThrow();
 * const result = await http.post(
 *   url.withPath("/my-route"),
 *   { data: "foo" },
 *   schema,
 *   {
 *     credentials: "include",
 *     signal: AbortSignal.timeout(10_000),
 *   },
 * );
 * if (result.isOk()) {
 *   // result.value.data
 * } else if (result.error instanceof HttpError) {
 *   // result.error.response.status
 * } else if (result.error instanceof AbortError) {
 *   // ignore
 * } else {
 *   // result.error
 * }
 * ```
 */
export const post = <T>(
  url: Url | InternalUrl,
  data: JsonSerializable,
  schema: ZodMiniType<T>,
  options?: RequestOptions,
): AsyncResult<T, PostJsonError<T>> => postResponse(url, data, options).andThen(fromSchema(schema));
