const MAX_PENDING_POLLS = 5;

// useQuery only registers a failure on a throw, so a still-generating thumbnail throws this to drive
// retry (the poll) — not a real error.
export const THUMBNAIL_PENDING = new Error("thumbnail pending");

// useQuery `retry` for a thumbnail query: polls a Pending thumbnail, never retries a real error.
export const retryPendingThumbnail = (failureCount: number, error: unknown): boolean =>
  error === THUMBNAIL_PENDING && failureCount < MAX_PENDING_POLLS;
