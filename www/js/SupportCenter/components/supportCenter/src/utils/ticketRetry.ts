import { TicketActionError } from "../types";
import { shouldAutoRetry } from "./httpError";

// Maximum number of automatic retries after the initial attempt (so up to
// MAX_TICKET_ACTION_RETRIES + 1 total attempts). The idempotency key reused
// across attempts makes these retries safe against duplicate ticket writes.
export const MAX_TICKET_ACTION_RETRIES = 1;

const MAX_RETRY_DELAY_MS = 8000;

// Shared retry predicate for ticket action mutations (reply submit, share
// accept/decline). Auto-retry the standard retryable failures (see shouldAutoRetry):
// - retryable statuses + no-response failures (timeout / network drop).
// - reused idempotency key keeps retries safe against duplicate writes.
// - non-retryable 4xx (e.g. moderation) is deterministic, so we don't retry.
export const shouldRetryTicketAction = (failureCount: number, error: unknown): boolean => {
  if (error instanceof TicketActionError) {
    return false;
  }

  if (!shouldAutoRetry(error)) {
    return false;
  }

  return failureCount <= MAX_TICKET_ACTION_RETRIES;
};

// Exponential backoff (1s, 2s, 4s, ...) capped at MAX_RETRY_DELAY_MS.
export const getTicketActionRetryDelay = (attemptIndex: number): number =>
  Math.min(1000 * 2 ** attemptIndex, MAX_RETRY_DELAY_MS);
