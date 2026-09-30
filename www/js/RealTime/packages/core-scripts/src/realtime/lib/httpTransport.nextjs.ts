import * as http from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import type { UrlConfig } from "../../http";
import type { RealtimeHttpTransport } from "./httpTransport";

// Next.js transport. CSRF/retry/locale/Sentry come from the host's setClientInterceptors
// (@rbx/www-nextjs instrumentation-client.ts) — no manual wiring here.
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
const nextjs: RealtimeHttpTransport = {
  get: <T>(config: UrlConfig): Promise<T> =>
    http
      .getUntyped(Url.parse(config.url).getOrThrow(), { credentials: "include" })
      .getOrThrow() as unknown as Promise<T>,
  post: <T>(config: UrlConfig, data?: object): Promise<T> =>
    http
      .postUntyped(Url.parse(config.url).getOrThrow(), (data ?? {}) as JsonSerializable, {
        credentials: "include",
      })
      .getOrThrow() as unknown as Promise<T>,
};
/* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

export default nextjs;
