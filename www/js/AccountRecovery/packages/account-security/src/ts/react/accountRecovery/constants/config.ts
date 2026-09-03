import { HttpResponseCodes } from "@rbx/core-scripts/http";

export const PASSKEY_ERROR_MESSAGE_TIMER = 1000; // 1 seconds

// Keep the automatic interval running after transient failures. Other
// errors are terminal and stop polling.
export const isRetryableRecoveryIntentRequestError = (errorStatusCode: number | null): boolean =>
  errorStatusCode === null ||
  errorStatusCode === HttpResponseCodes.tooManyAttempts ||
  errorStatusCode >= HttpResponseCodes.serverError;

export const isRetryableRecoveryIntentVerifyError = (errorStatusCode: number | null): boolean =>
  errorStatusCode === HttpResponseCodes.conflict ||
  isRetryableRecoveryIntentRequestError(errorStatusCode);
