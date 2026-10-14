import * as z from "zod/mini";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";

// Next-clean port of the legacy `window.Roblox.ThumbnailMetrics` global
// (Roblox/website: wwwroot/js/Thumbnails/thumbnailMetrics.js). Same endpoints and
// metadata-driven sampling, but transport is @rbx/core-lib/http (no jQuery) and the host
// comes from @rbx/environment-urls, so it works on both .NET and Next.js.

const metricsUrl = Url.parse(environmentUrls.metricsApi).getOrThrow();
const loadUrl = metricsUrl.withPath("/v1/thumbnails/load");
const metadataUrl = metricsUrl.withPath("/v1/thumbnails/metadata");

const loadStates = { complete: "complete", timeout: "timeout" } as const;

const metadataSchema = z.object({ logRatio: z.number() });

// Sampling ratio, fetched once from the metadata endpoint. A failed/absent fetch leaves the
// AsyncResult in an error state, so `.map` below is skipped and nothing is logged (ratio 0),
// matching the legacy default.
let logProbability: ReturnType<typeof fetchLogProbability> | null = null;

const fetchLogProbability = () =>
  http
    .get(metadataUrl, metadataSchema, {
      credentials: "include",
      signal: AbortSignal.timeout(3_000),
    })
    .map(data => data.logRatio);

const post = (params: Record<string, string>): void => {
  http.postUntyped(loadUrl.withSearchParams(params), "", {
    credentials: "include",
    keepalive: true,
    signal: AbortSignal.timeout(3_000),
  });
};

/** Log a completed thumbnail load, sampled at the metadata-provided ratio. */
export const logFinalThumbnailTime = (duration: number, thumbnailType = ""): void => {
  logProbability ??= fetchLogProbability();
  logProbability.map(probability => {
    const sampled = Math.random() <= probability;
    if (sampled) {
      post({ duration: String(duration), loadState: loadStates.complete, thumbnailType });
    }
    return sampled;
  });
};

/** Log a thumbnail load timeout (not sampled — matches legacy behavior). */
export const logThumbnailTimeout = (thumbnailType = ""): void => {
  post({ loadState: loadStates.timeout, thumbnailType });
};
