import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import type { RecommendationsTransport, RecsUrlConfig } from "./recommendationsRequests";

/**
 * Next.js transport for RecommendationsService, using @rbx/core-lib/http.
 *
 * No manual CSRF/auth wiring — @rbx/www-nextjs instrumentation-client.ts calls
 * setClientInterceptors() from @rbx/www-common/http before any component code runs, so every
 * http.getUntyped call here inherits CSRF, locale, and Sentry automatically. See
 * avatarAPIService.nextjs.ts for the same pattern.
 */
const nextjs: RecommendationsTransport = {
  get: <T>(urlConfig: RecsUrlConfig, params?: object): Promise<T> => {
    let url = Url.parse(urlConfig.url).getOrThrow();
    if (params) {
      url = url.withSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)] as const),
      );
    }
    return http.getUntyped(url, { credentials: "include" }).getOrThrow() as unknown as Promise<T>;
  },
};

export default nextjs;
