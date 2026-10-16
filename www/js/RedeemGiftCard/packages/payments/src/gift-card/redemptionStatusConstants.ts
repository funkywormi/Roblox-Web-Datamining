// Exceed the gateway's 500ms timeout to receive its 504 instead of an Axios abort without a status.
export const REDEMPTION_STATUS_REQUEST_TIMEOUT_MS = 1000;

export const REDEMPTION_STATUS_POLL_INTERVAL_MS = 250;

export const REDEMPTION_STATUS_FAST_POLLS = 5;
export const REDEMPTION_STATUS_MAX_POLL_INTERVAL_MS = 1000;
export const REDEMPTION_STATUS_POLL_TIMEOUT_MS = 15000;

export const REDEMPTION_STATUS_FAILURE_REASONS = {
  BadRequest: "bad_request",
  Throttled: "throttled",
  Transient: "transient",
  Unexpected: "unexpected",
} as const;

export const REDEMPTION_POLL_OUTCOMES = {
  Terminal: "terminal",
  Exhausted: "exhausted",
  Cancelled: "cancelled",
  Failed: "failed",
} as const;
