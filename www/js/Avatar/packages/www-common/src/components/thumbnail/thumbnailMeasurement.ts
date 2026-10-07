import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import { parseInt } from "@rbx/core-lib/number";
import { serialize } from "@rbx/core-lib/json";

// Next-clean port of @rbx/thumbnails `logMeasurement` (components/thumbnails/src/metrics). Posts
// batched perf measurements (ThumbnailLoadDurationWebapp / ThumbnailNoRetrySuccessWebapp /
// ThumbnailRetryWebapp / ThumbnailTimeoutWebapp / ThumbnailStatusCountWebapp) to beaconApi.
// Transport is @rbx/core-lib/http (CSRF via its interceptors) + a small local batcher, since
// www-common cannot import core-scripts' batch-request / fetchWithCsrf (it sits below core-scripts).

export type ThumbnailMeasurementData = {
  Status?: string;
  ThumbnailType?: string;
  Value?: string;
  Version?: string;
};

type Measure = { metricName: string; jsonData: string };

const measurementsUrl = Url.parse(`${environmentUrls.beaconApi}/v1/measurements`).getOrThrow();

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_BATCH_WAIT_MS = 1000;

// Batch config mirrors the legacy `performance` meta tag; client-only, SSR-safe.
const readBatchConfig = (): { batchSize: number; waitMs: number } => {
  if (typeof document === "undefined") {
    return { batchSize: DEFAULT_BATCH_SIZE, waitMs: DEFAULT_BATCH_WAIT_MS };
  }
  const meta = document.getElementsByName("performance")[0];
  const size = parseInt(meta?.getAttribute("data-ui-performance-metrics-batch-size") ?? "");
  const [h, m, s] = (meta?.getAttribute("data-ui-performance-metrics-batch-wait-time") ?? "").split(
    ":",
  );
  const waitMs =
    ((parseInt(h ?? "") ?? 0) * 3600 + (parseInt(m ?? "") ?? 0) * 60 + (parseInt(s ?? "") ?? 0)) *
    1000;
  return {
    batchSize: size ?? DEFAULT_BATCH_SIZE,
    waitMs: waitMs === 0 ? DEFAULT_BATCH_WAIT_MS : waitMs,
  };
};

let queue: Measure[] = [];
let scheduled = false;

const flush = (): void => {
  scheduled = false;
  if (queue.length === 0) {
    return;
  }
  const measures = queue;
  queue = [];
  http.postUntyped(measurementsUrl, measures, {
    credentials: "include",
    keepalive: true,
    signal: AbortSignal.timeout(3_000),
  });
};

/** Queue a thumbnail perf measurement; flushed in a batch (matches the legacy batching). */
export const logMeasurement = (metricName: string, jsonData: ThumbnailMeasurementData): void => {
  const encoded = serialize(jsonData);
  queue.push({ metricName, jsonData: encoded.isOk() ? encoded.value : "{}" });
  const { batchSize, waitMs } = readBatchConfig();
  if (queue.length >= batchSize) {
    flush();
  } else if (!scheduled) {
    scheduled = true;
    setTimeout(flush, waitMs);
  }
};
