// The core-scripts http layer (axios + response interceptor) rejects with
// different shapes depending on the failure:
// - server responded non-2xx -> the AxiosResponse, so `status`/`data` are at the
//   top level;
// - network error / timeout / no response -> `undefined`;
// - `fullError: true` (not used here) -> the AxiosError, with `status`/`data`
//   nested under `response`.
// These helpers normalize across those shapes so callers never read off
// `undefined` or miss a nested status.
type MaybeHttpError =
  | {
      status?: number;
      data?: { code?: number };
      response?: { status?: number; data?: { code?: number } };
    }
  | null
  | undefined;

export const getHttpErrorStatus = (err: unknown): number | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const e = err as MaybeHttpError;
  return e?.status ?? e?.response?.status;
};

export const getHttpErrorCode = (err: unknown): number | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const e = err as MaybeHttpError;
  return e?.data?.code ?? e?.response?.data?.code;
};

// Statuses we automatically retry, mirroring @rbx/core-lib/http
// `defaultRetryableHttpStatuses`. supportCenter is on the axios-based
// core-scripts http stack and can't reuse core-lib's fetch-based retry helpers
// directly, so we replicate the platform's retryable set here to stay consistent
// with the standard.
const RETRYABLE_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

// Reset the idempotency key after a failure only on a non-retryable 4xx, i.e. a
// definitive server rejection -> the next attempt should start fresh.
// - Other failures (retryable statuses, 5xx, no response): keep the key so a
//   reattempt dedupes against a write that may have landed.
export const shouldResetIdempotencyKey = (err: unknown): boolean => {
  const status = getHttpErrorStatus(err);
  return (
    status !== undefined && status >= 400 && status < 500 && !RETRYABLE_HTTP_STATUSES.has(status)
  );
};

// Auto-retry (with backoff) the standard retryable failures:
// - a standard retryable status (see RETRYABLE_HTTP_STATUSES), or
// - a no-response failure (timeout / network drop, surfaced as `undefined`),
//   which the standard (core-lib's UnknownFetchError) also retries.
export const shouldAutoRetry = (err: unknown): boolean => {
  const status = getHttpErrorStatus(err);
  if (status === undefined) {
    return true;
  }
  return RETRYABLE_HTTP_STATUSES.has(status);
};
