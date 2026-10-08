import { isAxiosError } from "../utils/isAxiosError";

/** HTTP status for an API failure, or NonAxiosError when the thrown value is not an HTTP error. */
export function apiErrorStatusCode(error: unknown): string {
  if (!isAxiosError(error)) {
    return "NonAxiosError";
  }
  const status = error.response?.status;
  return status ? String(status) : "UnknownAxiosError";
}
