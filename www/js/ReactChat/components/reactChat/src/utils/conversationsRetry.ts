// Retry policy for the conversation-list query (ROACTCHAT-2678).
//
// The endpoint rate-limits (429) when chat is reloaded rapidly. Blindly retrying a 429 fires more
// requests inside the same window — they can't succeed and only deepen the throttle. So we retry a
// 429 only a couple of times, and (via the delay below) only after a long, jittered backoff that
// lets the list self-heal once the window passes without hammering. Other 4xx won't fix themselves
// on retry; genuine transient failures (network / 5xx) keep the quick retries that recover a flaky
// cold boot.

const MAX_TRANSIENT_RETRIES = 3;
const MAX_RATE_LIMIT_RETRIES = 2;
const RATE_LIMIT_BACKOFF_BASE_MS = 4000;
const TRANSIENT_BACKOFF_BASE_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const RATE_LIMIT_JITTER_MS = 1000;

const HTTP_STATUS_REQUEST_TIMEOUT = 408;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;

/**
 * Pull the numeric HTTP status out of whatever the http client rejected with — an Axios-style
 * `error.response.status` (.NET transport) or a bare `error.status` (core-lib `HttpError`). Returns
 * undefined for a network error with no response, which we treat as transient.
 */
export const getHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  const e = error as { status?: unknown; response?: { status?: unknown } };
  return [e.response?.status, e.status].find((value): value is number => typeof value === "number");
};

/** React Query `retry` predicate for the conversation-list query. */
export const shouldRetryConversations = (failureCount: number, error: unknown): boolean => {
  const status = getHttpStatus(error);
  if (status === HTTP_STATUS_TOO_MANY_REQUESTS) {
    return failureCount < MAX_RATE_LIMIT_RETRIES;
  }
  // Other 4xx won't fix themselves on retry — except 408 (Request Timeout), which is transient like
  // a 5xx and keeps the quick retries.
  if (
    status !== undefined &&
    status >= 400 &&
    status < 500 &&
    status !== HTTP_STATUS_REQUEST_TIMEOUT
  ) {
    return false;
  }
  return failureCount < MAX_TRANSIENT_RETRIES;
};

/**
 * React Query `retryDelay` for the conversation-list query. A 429 backs off far harder than a
 * transient failure and adds jitter so several tabs/accounts hitting the limit at once don't retry
 * in lockstep (which would just re-trip the rate limit together).
 */
export const conversationsRetryDelayMs = (failureCount: number, error: unknown): number => {
  if (getHttpStatus(error) === HTTP_STATUS_TOO_MANY_REQUESTS) {
    const base = Math.min(RATE_LIMIT_BACKOFF_BASE_MS * 2 ** failureCount, MAX_BACKOFF_MS);
    return base + Math.floor(Math.random() * RATE_LIMIT_JITTER_MS);
  }
  return Math.min(TRANSIENT_BACKOFF_BASE_MS * 2 ** failureCount, MAX_BACKOFF_MS);
};
