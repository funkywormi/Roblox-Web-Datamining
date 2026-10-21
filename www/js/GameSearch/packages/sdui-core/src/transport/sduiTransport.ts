import * as coreHttp from "@rbx/core-lib/http";
import type { FetchError } from "@rbx/core-lib/http";
import type { AsyncResult } from "@rbx/core-lib";
import type { Url } from "@rbx/core-lib/url";
import type { SduiPostBody } from "../types";

/** Per-call overrides on the transport. Timeout policy lives in the store, not here. */
export interface SduiFetchOptions {
  signal?: AbortSignal;
  method?: "GET" | "POST";
  body?: SduiPostBody;
}

/**
 * SDUI transport. Thin wrapper that decides the protocol/network stack to use:
 *
 * - Browser (Http): `@rbx/core-lib/http` so client-only interceptors (CSRF, tracing)
 *   apply and credentials are forwarded.
 */
export function sduiFetch(
  url: Url,
  headers: Record<string, string>,
  options?: SduiFetchOptions,
): AsyncResult<Response, FetchError> {
  const method = options?.method ?? "GET";
  return coreHttp.fetch(url, {
    method,
    headers,
    credentials: "include",
    ...(options?.signal ? { signal: options.signal } : {}),
    ...(method !== "GET" && options?.body !== undefined ? { body: options.body } : {}),
  });
}
