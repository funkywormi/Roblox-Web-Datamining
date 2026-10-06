import * as http from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";

export type RealtimeUrlConfig = {
  url: string;
  withCredentials?: boolean;
};

export type RealtimeHttpTransport = {
  get: <T>(config: RealtimeUrlConfig) => Promise<T>;
  post: <T>(config: RealtimeUrlConfig, data?: object) => Promise<T>;
};

// Default for Next.js: CSRF/retry/locale/Sentry come from the host's setClientInterceptors.
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
const coreLibTransport: RealtimeHttpTransport = {
  get: <T>(config: RealtimeUrlConfig): Promise<T> =>
    http
      .getUntyped(Url.parse(config.url).getOrThrow(), { credentials: "include" })
      .getOrThrow() as unknown as Promise<T>,
  post: <T>(config: RealtimeUrlConfig, data?: object): Promise<T> =>
    http
      .postUntyped(Url.parse(config.url).getOrThrow(), (data ?? {}) as JsonSerializable, {
        credentials: "include",
      })
      .getOrThrow() as unknown as Promise<T>,
};
/* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

let transport = coreLibTransport;

// The .NET host (core-scripts/realtime) swaps in its axios client.
export const setRealtimeHttpTransport = (next: RealtimeHttpTransport): void => {
  transport = next;
};

const httpTransport: RealtimeHttpTransport = {
  get: config => transport.get(config),
  post: (config, data) => transport.post(config, data),
};

export default httpTransport;

// axios rejects with the response object (top-level status); core-lib throws HttpError (response.status).
export const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }
  if (
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }
  return undefined;
};
