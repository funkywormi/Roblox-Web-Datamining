import { Mutable, Prettify } from "../commonTypes";
import { AbortError } from "../abort";
import { Url } from "../url";
import { InternalUrl } from "../url/internal";
import { JsonDeserializationError, JsonSerializationError } from "../json";
import { AsyncResult } from "../result";

/**
 * The error for when a fetch response is not ok (status code is not in the `200-299` range).
 *
 * Includes the following information/fields:
 * - {@link url}
 * - {@link request}
 * - {@link response}
 *
 * Construct via {@link HttpError.new}.
 *
 * Note: {@link url} is the request URL, whereas `response.url` is the final URL
 * after redirects.
 */
export class HttpError extends Error {
  private constructor(
    /** The url of the request. */
    readonly url: Url | InternalUrl,
    /** The options used for the request . */
    readonly request: RequestInfo,
    /** The response information (headers, status, etc.). */
    readonly response: ResponseInfo,
  ) {
    super(`${response.status} ${request.method} ${url.href}`);
  }

  /**
   * Build an {@link HttpError} from a response. Pass `bodyText` (read by the caller) to populate
   * {@link ResponseInfo.body}; omit it to leave the body `undefined`.
   */
  static new(
    url: Url | InternalUrl,
    request: RequestInfo,
    resp: Readonly<Response>,
    body?: string,
  ): HttpError {
    const { headers, redirected, status, statusText, type, url: finalUrl } = resp;
    return new HttpError(url, request, {
      headers,
      redirected,
      status,
      statusText,
      type,
      url: finalUrl,
      body,
    });
  }
}

/** The error for when a fetch call throws for an unknown reason. */
export class UnknownFetchError extends Error {
  constructor(readonly cause: Error) {
    super(cause.message, { cause });
  }
}

/**
 * The possible errors that can occur for a fetch request:
 * - {@link HttpError}: the response status was not in the `200-299` range.
 * - {@link AbortError}: the request was aborted or timed out.
 * - {@link UnknownFetchError}: some other unknown fetch error occurred.
 * - {@link Error}: some other custom error originating from an interceptor.
 */
export type FetchError = UnknownFetchError | AbortError | HttpError | Error;

/**
 * The possible errors that can occur for a fetch request returning JSON data:
 * - {@link HttpError}: the response status was not in the `200-299` range.
 * - {@link AbortError}: the request was aborted or timed out.
 * - {@link JsonDeserializationError}: the response JSON was invalid (syntax error or validation error).
 * - {@link UnknownFetchError}: some other unknown fetch error occurred.
 * - {@link Error}: some other custom error originating from an interceptor.
 */
export type FetchJsonError<T = never> = FetchError | JsonDeserializationError<T>;

/**
 * The possible errors that can occur for a fetch request returning JSON data:
 * - {@link HttpError}: the response status was not in the `200-299` range.
 * - {@link AbortError}: the request was aborted or timed out.
 * - {@link JsonSerializationError}: the value for the request body could not be serialized into JSON (contains circular references).
 * - {@link JsonDeserializationError}: the response JSON was invalid (syntax error or validation error).
 * - {@link UnknownFetchError}: some other unknown fetch error occurred.
 * - {@link Error}: some other custom error originating from an interceptor.
 */
export type PostJsonError<T = never> = FetchJsonError<T> | JsonSerializationError;

/**
 * A function that determines the retry delay, in milliseconds, based on the number of failed retries and the last error.
 *
 * `failedRetries` indicates the number of retries that have failed. That is, it does not count the initial request
 * failure. So, `failedRetries` will be `0` the first time the retry function is called.
 *
 * To indicate that no more retries should be performed, the retry function should return `null` or `NaN`.
 */
export type RetryDelayFunction = (failedRetries: number, error: FetchError) => number | null;

export const httpMethods = ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"] as const;

export type HttpMethod = (typeof httpMethods)[number];

/**
 * The options for a fetch request.
 *
 * A superset of {@link RequestInit}. See the [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit).
 */
export type FetchOptions = Prettify<
  Readonly<
    Omit<RequestInit, "method"> & {
      method?: HttpMethod;
      /** The {@link RetryDelayFunction} that should be used to determine the retry delay. */
      retry?: RetryDelayFunction;
      /**
       * When `true`, the body of any non-ok response is read and included in the
       * {@link HttpError.response} (as {@link ResponseInfo.body}).
       */
      includeBodyOnError?: boolean;
    }
  >
>;

/**
 * The options for a get or post request.
 *
 * Contains most of the options from {@link RequestInit} as well as a few additional ones.
 * See the [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit).
 */
export type RequestOptions = Prettify<Omit<FetchOptions, "body" | "method">>;

/**
 * The options for a fetch request excluding the body. Has required headers and method as well as an optional retry delay function.
 *
 * Contains most of the options from {@link RequestInit}. See the [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit).
 */
export type RequestInfo = Prettify<
  Readonly<
    Omit<FetchOptions, "body" | "headers" | "method"> & {
      method: HttpMethod;
      headers: Headers;
    }
  >
>;

/**
 * The response to a fetch request. Includes headers, status, etc.
 *
 * A subset of {@link Response} (methods that operate on the body are omitted). The {@link body} field is populated only when the {@link FetchOptions.includeBodyOnError} option is set to `true`.
 *
 * See the [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Response).
 */
export type ResponseInfo = Prettify<
  Readonly<Omit<Response, keyof Body | "clone" | "ok"> & { body?: string }>
>;

/**
 * A HTTP fetch function.
 *
 * Takes a URL and a {@link RequestInfo} as input and returns an {@link AsyncResult} of
 * either a {@link Response} or a {@link FetchError}.
 *
 * See {@link setInterceptors} for more information.
 */
export type FetchFunction = (
  url: Url | InternalUrl,
  options: Mutable<RequestInfo>,
) => AsyncResult<Response, FetchError>;

/**
 * A HTTP interceptor.
 *
 * Wraps the next interceptor and returns another {@link FetchFunction}.
 *
 * See {@link setInterceptors} for more information.
 */
export type HttpInterceptor = (next: FetchFunction) => FetchFunction;
