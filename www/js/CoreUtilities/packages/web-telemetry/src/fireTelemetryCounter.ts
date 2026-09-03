import { create } from "@bufbuild/protobuf";
import BatchRequestFactory, {
  type BatchRequestProcessor,
} from "@rbx/core-scripts/util/batch-request";
import environmentUrls from "@rbx/environment-urls";
import { EngineTelemetryBatchEventSchema } from "@rbx/event-stream-proto/eventstream/enginetelemetry/engine_telemetry_batch_event_pb";
import { EngineTelemetryCounterMetricEventSchema } from "@rbx/event-stream-proto/eventstream/enginetelemetry/engine_telemetry_counter_metric_event_pb";
import { EventStreamClient } from "@rbx/event-stream-v2";

import { toEngineTelemetryAttributes } from "./attributes";
import type { Attributes, FireTelemetryCounterFn } from "./types";
import { isValidIdentifier } from "./validate";

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_BATCH_INTERVAL_MS = 250;
const DEFAULT_MAX_RETRY_ATTEMPTS = 3;
const BACKOFF_MIN_MS = 500;
const BACKOFF_MAX_MS = 2000;

export type CreateFireTelemetryCounterOptions = {
  batchSize?: number;
  batchIntervalMs?: number;
  maxRetryAttempts?: number;
  onError?: (error: string, context: { name: string; attributes?: Attributes }) => void;
};

type QueuedEvent = {
  id: number;
  name: string;
  attributes?: Attributes;
  value: number;
  timestampMs: number;
};
type ProcessorResult = Record<string, boolean>;

const processors: BatchRequestProcessor<QueuedEvent, ProcessorResult>[] = [];
let listenersInstalled = false;

function flushAll(): void {
  for (const p of processors) {
    p.processQueue();
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

export function createFireTelemetryCounter(
  featureName: string,
  options?: CreateFireTelemetryCounterOptions,
): FireTelemetryCounterFn {
  function reportError(msg: string, context: { name: string; attributes?: Attributes }): void {
    if (options?.onError) {
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
  const factory = new BatchRequestFactory<QueuedEvent, ProcessorResult>();
  let idCounter = 0;

  const processor = factory.createRequestProcessor(
    async items => {
      // One EngineTelemetryBatchEvent per flush carries every buffered counter
      // under counters[], so the whole window ships as a single envelope for the
      // engine-telemetry batch consumer.
      const counters = items.map(({ data }) =>
        create(EngineTelemetryCounterMetricEventSchema, {
          name: data.name,
          value: data.value,
          eventTimestampMillisecond: BigInt(data.timestampMs),
          attributes: data.attributes ? toEngineTelemetryAttributes(data.attributes) : {},
        }),
      );
      const results: ProcessorResult = {};
      await client.sendEvent(EngineTelemetryBatchEventSchema, {
        counters,
        batchTimestampMilliseconds: BigInt(Date.now()),
      });
      items.forEach(({ key }) => {
        results[key] = true;
      });
      return results;
    },
    ({ id }) => id.toString(),
    {
      batchSize: options?.batchSize ?? DEFAULT_BATCH_SIZE,
      processBatchWaitTime: options?.batchIntervalMs ?? DEFAULT_BATCH_INTERVAL_MS,
      maxRetryAttempts: options?.maxRetryAttempts ?? DEFAULT_MAX_RETRY_ATTEMPTS,
      getFailureCooldown: factory.createExponentialBackoffCooldown(BACKOFF_MIN_MS, BACKOFF_MAX_MS),
    },
  );

  processors.push(processor);
  installLifecycleListeners();

  function fireTelemetryCounter(name: string, attributes?: Attributes, value?: number): void {
    const fullName = `${featureName}_${name}`;
    if (!isValidPayload(fullName, attributes)) {
      reportError("@rbx/web-telemetry: invalid event name or attribute key", {
        name,
        attributes,
      });
      return;
    }

    const resolvedValue = value ?? 1;
    if (!Number.isFinite(resolvedValue)) {
      reportError("@rbx/web-telemetry: value must be a finite number", { name, attributes });
      return;
    }

    const finalAttributes =
      attributes && Object.keys(attributes).length > 0 ? attributes : undefined;

    idCounter += 1;
    processor
      .queueItem({
        id: idCounter,
        name: fullName,
        attributes: finalAttributes,
        value: resolvedValue,
        timestampMs: Date.now(),
      })
      .catch((err: unknown) => {
        console.error("@rbx/web-telemetry: queue rejection", err);
      });
  }

  return fireTelemetryCounter;
}

export type { Attributes, FireTelemetryCounterFn } from "./types";
