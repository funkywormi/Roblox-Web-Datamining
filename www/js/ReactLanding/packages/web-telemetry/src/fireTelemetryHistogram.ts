import { create } from "@bufbuild/protobuf";
import environmentUrls from "@rbx/environment-urls";
import { EngineTelemetryBatchEventSchema } from "@rbx/event-stream-proto/eventstream/enginetelemetry/engine_telemetry_batch_event_pb";
import { EngineTelemetryHistogramMetricEventSchema } from "@rbx/event-stream-proto/eventstream/enginetelemetry/engine_telemetry_histogram_metric_event_pb";
import { EventStreamClient } from "@rbx/event-stream-v2";

import { toEngineTelemetryAttributes } from "./attributes";
import type { Attributes, FireTelemetryHistogramFn } from "./types";
import { isValidIdentifier } from "./validate";

const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const BATCH_EVENT_VERSION = BigInt(1);

function newBatchUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `web-telemetry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const VM_E10_MIN = -4;
const VM_BUCKETS_PER_DECIMAL = 18;
const VM_TOTAL_POSITIVE_BUCKETS = (11 - VM_E10_MIN) * VM_BUCKETS_PER_DECIMAL; // 270

export function getVmBucketIndex(value: number): number {
  if (value <= 0) return -1;
  if (value < 1e-4) return 1;
  if (value > 1e11) return VM_TOTAL_POSITIVE_BUCKETS + 2;

  const log10 = Math.log10(value);
  let idx = Math.floor((log10 - VM_E10_MIN) * VM_BUCKETS_PER_DECIMAL);
  if (Math.abs((log10 - VM_E10_MIN) * VM_BUCKETS_PER_DECIMAL - idx) < 1e-9 && idx > 0) {
    idx -= 1;
  }
  return idx + 2;
}

export type CreateFireTelemetryHistogramOptions = {
  flushIntervalMs?: number;
  onError?: (error: string, context: { name: string }) => void;
};

type Accumulator = {
  name: string;
  attributes: Attributes | undefined;
  sum: number;
  count: number;
  bucketCounts: Map<number, number>;
};

const flushCallbacks: (() => void)[] = [];
let listenersInstalled = false;

function flushAll(): void {
  for (const cb of flushCallbacks) {
    cb();
  }
}

function installLifecycleListeners(): void {
  if (listenersInstalled) {
    return;
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flushAll();
      }
    });
  }
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", flushAll);
  }
  listenersInstalled = true;
}

function isValidPayload(name: string, attributes?: Attributes): boolean {
  if (!isValidIdentifier(name)) {
    return false;
  }
  if (attributes) {
    for (const key of Object.keys(attributes)) {
      if (!isValidIdentifier(key)) {
        return false;
      }
    }
  }
  return true;
}

export function createFireTelemetryHistogram(
  featureName: string,
  options: CreateFireTelemetryHistogramOptions,
): FireTelemetryHistogramFn {
  const flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;

  function reportError(msg: string, context: { name: string }): void {
    if (options.onError) {
      options.onError(msg, context);
    } else {
      console.error(msg, context);
    }
  }

  if (!isValidIdentifier(featureName)) {
    reportError(`@rbx/web-telemetry: invalid featureName "${featureName}"`, {
      name: featureName,
    });
    return () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  }

  const client = new EventStreamClient({ baseUrl: environmentUrls.apiGatewayUrl });
  let accumulators = new Map<string, Accumulator>();
  let flushTimer: ReturnType<typeof setTimeout> | undefined;

  function accumulatorKey(name: string, attributes: Attributes | undefined): string {
    if (!attributes || Object.keys(attributes).length === 0) {
      return name;
    }
    const sorted = Object.keys(attributes).sort();
    const encoded = sorted.map(k => `${k}=${attributes[k]}`).join("&");
    return `${name}|${encoded}`;
  }

  function buildSparseBuckets(bucketCounts: Map<number, number>): {
    bucketIndices: number[];
    countsInBuckets: bigint[];
  } {
    const bucketIndices: number[] = [];
    const countsInBuckets: bigint[] = [];

    for (const [index, count] of bucketCounts) {
      if (count > 0) {
        bucketIndices.push(index);
        countsInBuckets.push(BigInt(count));
      }
    }

    return { bucketIndices, countsInBuckets };
  }

  function flush(): void {
    if (accumulators.size === 0) {
      return;
    }

    const snapshot = accumulators;
    accumulators = new Map();
    const nowMs = BigInt(Date.now());

    // Ingest expects histograms nested under EngineTelemetryBatchEvent.stats
    // (engine envelope), not as top-level HistogramMetricEvent sources.
    const stats = Array.from(snapshot.values(), acc =>
      create(EngineTelemetryHistogramMetricEventSchema, {
        name: acc.name,
        sum: acc.sum,
        count: BigInt(acc.count),
        ...buildSparseBuckets(acc.bucketCounts),
        eventTimestampMillisecond: nowMs,
        attributes: acc.attributes ? toEngineTelemetryAttributes(acc.attributes) : undefined,
      }),
    );

    client
      .sendBatch([
        {
          schema: EngineTelemetryBatchEventSchema,
          msg: create(EngineTelemetryBatchEventSchema, {
            version: BATCH_EVENT_VERSION,
            uuid: newBatchUuid(),
            batchTimestampMilliseconds: nowMs,
            stats,
            counters: [],
            points: [],
          }),
        },
      ])
      .catch((err: unknown) => {
        console.error("@rbx/web-telemetry: histogram flush failed", err);
      });
  }

  function scheduleFlush(): void {
    if (flushTimer !== undefined) {
      return;
    }
    flushTimer = setTimeout(() => {
      flushTimer = undefined;
      flush();
      if (accumulators.size > 0) {
        scheduleFlush();
      }
    }, flushIntervalMs);
  }

  flushCallbacks.push(flush);
  installLifecycleListeners();

  function fireTelemetryHistogram(name: string, attributes?: Attributes, value?: number): void {
    const fullName = `${featureName}_${name}`;
    if (!isValidPayload(fullName, attributes)) {
      reportError("@rbx/web-telemetry: invalid event name or attribute key", { name });
      return;
    }

    const resolvedValue = value ?? 0;
    if (!Number.isFinite(resolvedValue)) {
      reportError("@rbx/web-telemetry: value must be a finite number", { name });
      return;
    }

    const finalAttributes =
      attributes && Object.keys(attributes).length > 0 ? attributes : undefined;

    const key = accumulatorKey(fullName, finalAttributes);
    let acc = accumulators.get(key);
    if (!acc) {
      acc = {
        name: fullName,
        attributes: finalAttributes,
        sum: 0,
        count: 0,
        bucketCounts: new Map<number, number>(),
      };
      accumulators.set(key, acc);
    }

    acc.sum += resolvedValue;
    acc.count += 1;
    const bucketIdx = getVmBucketIndex(resolvedValue);
    acc.bucketCounts.set(bucketIdx, (acc.bucketCounts.get(bucketIdx) ?? 0) + 1);
    scheduleFlush();
  }

  return fireTelemetryHistogram;
}

export type { Attributes, FireTelemetryHistogramFn } from "./types";
