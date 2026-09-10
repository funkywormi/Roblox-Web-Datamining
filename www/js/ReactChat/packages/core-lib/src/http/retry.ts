import { abortableTimeout } from "../asyncResult";
import { errAsync, tryCatch } from "../result";
import { parseInt } from "../number";
import { timeout } from "../promise";
import { UnknownFetchError, FetchError, HttpError, HttpInterceptor } from "./types";

export const exponentialBackoff =
  (factor: number, maxDelay: number) =>
  (n: number): number =>
    Math.min(2 ** n * factor, maxDelay);

export const defaultRetryableHttpStatuses = [408, 429, 500, 502, 503, 504] as const;

export const retryAfterHeaderDelay = (error: FetchError): number | null => {
  if (!(error instanceof HttpError)) {
    return null;
  }
  const header = error.response.headers.get("Retry-After");
  if (header == null) {
    return null;
  }
  const delay = parseInt(header);
  if (delay != null) {
    return delay * 1000;
  }
  const date = tryCatch(
    () => new Date(header),
    () => null,
  ).getOrNull();
  if (date != null) {
    return date.getTime() - Date.now();
  }
  return null;
};

export const isRetryableError = (
  error: FetchError,
  retryableHttpStatuses: readonly number[] = defaultRetryableHttpStatuses,
): boolean =>
  error instanceof UnknownFetchError ||
  (error instanceof HttpError && retryableHttpStatuses.includes(error.response.status));

export const retryInterceptor: HttpInterceptor = next => (url, options) => {
  const { retry, signal } = options;
  return retry == null
    ? next(url, options)
    : next(url, options).orElse(async e => {
        let error = e;
        let i = 0;
        let delay = retry(i, error);
        while (delay != null && Number.isFinite(delay)) {
          if (delay > 0) {
            if (signal == null) {
              // eslint-disable-next-line no-await-in-loop
              await timeout(delay);
            } else {
              // eslint-disable-next-line no-await-in-loop
              const result = await abortableTimeout(delay, signal);
              if (result.isErr()) {
                return result.cast();
              }
            }
          }

          i += 1;
          options.headers.set("x-retry-attempt", i.toString());
          // eslint-disable-next-line no-await-in-loop
          const result = await next(url, options);
          if (result.isOk()) {
            return result;
          }

          ({ error } = result);
          delay = retry(i, error);
        }
        return errAsync(error);
      });
};
