import { AbortError, HttpError, UnknownFetchError } from "@rbx/core-lib/http";

const readStatus = (value: unknown): number | undefined => {
  if (value instanceof HttpError) {
    return value.response.status;
  }
  // core-scripts http rejects with the Axios response.
  if (value != null && typeof value === "object" && "status" in value) {
    return typeof value.status === "number" ? value.status : undefined;
  }
  return undefined;
};

/**
 * The `statusCode` dimension for a failed request: the HTTP status, "network" when no response
 * arrived, "aborted", or "unknown". The .NET transport rejects with `undefined` when there is no
 * response; the Next transport wraps HttpError as the `cause`.
 */
export const getStatusCode = (error: unknown): string => {
  if (error == null) {
    return "network";
  }
  const cause = error instanceof Error ? error.cause : undefined;
  const status = readStatus(error) ?? readStatus(cause);
  if (status != null) {
    return String(status);
  }
  if (error instanceof AbortError || cause instanceof AbortError) {
    return "aborted";
  }
  if (error instanceof UnknownFetchError || cause instanceof UnknownFetchError) {
    return "network";
  }
  return "unknown";
};
