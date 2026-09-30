/**
 * The error for when an {@link AbortSignal} is aborted.
 *
 * The possible cases are:
 * - `Abort`: indicates the signal was manually aborted via `abort()`.
 * - `Timeout`: indicates the signal timed out via `AbortSignal.timeout()`.
 * - `Reason`: indicates the signal was manually aborted via `abort(reason)` with a custom reason value.
 */
export type AbortErrorCause =
  | { readonly code: "Abort"; readonly message: string }
  | { readonly code: "Timeout"; readonly message: string }
  | { readonly code: "Reason"; readonly reason: unknown };

/**
 * The error for when an {@link AbortSignal} is aborted.
 *
 * The possible cases are:
 * - `Abort`: indicates the signal was manually aborted via `abort()`.
 * - `Timeout`: indicates the signal timed out via `AbortSignal.timeout()`.
 * - `Reason`: indicates the signal was manually aborted via `abort(reason)` with a custom reason value.
 */
export class AbortError extends Error {
  constructor(readonly cause: AbortErrorCause) {
    super(cause.code === "Reason" ? undefined : cause.message, { cause });
  }
}

export const abortErrorFromError = (error: unknown): AbortError | null =>
  error instanceof DOMException && (error.name === "AbortError" || error.name === "TimeoutError")
    ? new AbortError({
        code: error.name === "AbortError" ? "Abort" : "Timeout",
        message: error.message,
      })
    : null;

export const abortErrorFromSignal = (signal: AbortSignal): AbortError =>
  abortErrorFromError(signal.reason) ?? new AbortError({ code: "Reason", reason: signal.reason });
