import environmentUrls from "@rbx/environment-urls";
import type { AsyncResult } from "@rbx/core-lib";
import type { FetchError } from "@rbx/core-lib/http";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";

const metricsUrl = Url.parse(environmentUrls.metricsApi).getOrThrow();

// Fire a named counter to the metrics report-event endpoint. Next-clean (core-lib/http), so it works on
// both the .NET page and the Next.js app; hosts resolve from @rbx/environment-urls.
export const fireEvent = (name: string): AsyncResult<unknown, FetchError> =>
  http.postUntyped(metricsUrl.withPath("/v1/games/report-event").withSearchParams({ name }), "", {
    credentials: "include",
    keepalive: true,
    signal: AbortSignal.timeout(30_000),
  });
