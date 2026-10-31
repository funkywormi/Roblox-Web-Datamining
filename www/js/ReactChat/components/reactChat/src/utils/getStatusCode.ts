import { AbortError, UnknownFetchError } from "@rbx/core-lib/http";

/**
 * The `statusCode` dimension for a failed chat request: the HTTP status, "network" when no response
 * arrived, "aborted", or "unknown". Both transports reject an HTTP error as `{ response: { status } }`.
 */
export const getStatusCode = (error: unknown): string => {
  if (error instanceof AbortError) {
    return "aborted";
  }
  if (error == null || error instanceof UnknownFetchError) {
    return "network";
  }
  if (typeof error === "object") {
    const { response, status } = error as { response?: { status?: unknown }; status?: unknown };
    const code = [response?.status, status].find(value => typeof value === "number");
    if (code != null) {
      return String(code);
    }
  }
  return "unknown";
};
