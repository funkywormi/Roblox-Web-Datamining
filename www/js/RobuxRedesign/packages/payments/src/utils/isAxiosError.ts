import type { AxiosError } from "@rbx/core-scripts/http";

/**
 * Type guard for axios/httpService errors thrown from @rbx/core-scripts.
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === "object" && error !== null && "config" in error;
}
