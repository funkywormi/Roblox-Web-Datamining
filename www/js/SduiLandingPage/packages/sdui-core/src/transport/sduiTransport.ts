import * as coreHttp from "@rbx/core-lib/http";
import type { FetchError } from "@rbx/core-lib/http";
import type { AsyncResult } from "@rbx/core-lib";
import type { Url } from "@rbx/core-lib/url";

/** Per-call overrides on the  transport. Timeout policy lives in the store, not here. */
export interface SduiFetchOptions {
  signal?: AbortSignal;
}

/**
 * SDUI transport. Thin wrapper that decides the protocol/network stack to use:
 *
 * - Browser (Http): `@rbx/core-lib/http` so client-only interceptors (CSRF, tracing)
 *   apply and credentials are forwarded.
 *
 * TODO(lua-parity): POST body + Content-Type. `createSduiApiStore` lua
 * supports a `postConfig` (body + content type) — wire here when web needs it.
 */
export function sduiFetch(
  url: Url,
  headers: Record<string, string>,
  options?: SduiFetchOptions,
): AsyncResult<Response, FetchError> {
  return coreHttp.fetch(url, {
    method: "GET",
    headers,
    credentials: "include",
    ...(options ?? {}),
  });
}
