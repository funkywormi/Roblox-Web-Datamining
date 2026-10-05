import { AbortError, HttpError, type FetchError } from "@rbx/core-lib/http";

import { SduiErrorName } from "../errors";

export type SduiPageStatusCode = number | "unknown" | "timeout" | "aborted";

export interface ClassifiedFetchError {
  errorName: SduiErrorName;
  statusCode: SduiPageStatusCode;
  message: string;
}

/**
 * Pure classifier for the four shapes of fetch failure that
 * `sduiFetch` (a `coreHttp.fetch` wrapper) can surface:
 *
 * 1. `HttpError`           → `FailedToFetchPage`,         status = HTTP code
 * 2. `AbortError` + Timeout → `SduiRequestTimedOut`,      status = "timeout"
 * 3. `AbortError` + Abort/Reason → `SduiRequestAborted`,  status = "aborted"
 * 4. Anything else         → `FailedToFetchPage`,         status = "unknown"
 */
export function classifyFetchError(
  error: FetchError,
  errorMetadata: { timeoutMs: number },
): ClassifiedFetchError {
  if (error instanceof HttpError) {
    return {
      errorName: SduiErrorName.FailedToFetchPage,
      statusCode: error.response.status,
      message: error.message,
    };
  }
  if (error instanceof AbortError) {
    if (error.cause.code === "Timeout") {
      return {
        errorName: SduiErrorName.SduiRequestTimedOut,
        statusCode: "timeout",
        message:
          error.message === ""
            ? `SDUI request timed out after ${errorMetadata.timeoutMs}ms`
            : error.message,
      };
    }
    return {
      errorName: SduiErrorName.SduiRequestAborted,
      statusCode: "aborted",
      message: error.message,
    };
  }
  return {
    errorName: SduiErrorName.FailedToFetchPage,
    statusCode: "unknown",
    message: error.message,
  };
}
