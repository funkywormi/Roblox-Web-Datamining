import { sendCounterBatch, sendCounterBatchSync, type CounterEventData } from "./proto";
import type { Attributes, FireTelemetryCounterFn } from "../types";
import { isValidIdentifier } from "../validate";

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_BATCH_INTERVAL_MS = 250;

export type CreateFireTelemetryCounterOptions = {
  batchSize?: number;
  batchIntervalMs?: number;
  onError?: (error: string, context: { name: string; attributes?: Attributes }) => void;
};

type QueuedEvent = {
  name: string;
  attributes?: Attributes;
  value: number;
  timestampMs: bigint;
};

const queues: QueuedEvent[][] = [];
let listenersInstalled = false;
let isTearingDown = false;

function flush(items: QueuedEvent[], forceSync?: boolean): void {
  const counters: CounterEventData[] = items.map(data => ({
    name: data.name,
    value: data.value,
    timestampMs: data.timestampMs,
    attributes: data.attributes,
  }));
  const batchTimestampMs = BigInt(Date.now());
  const useSync =
    forceSync === true ||
    isTearingDown ||
    (typeof document !== "undefined" && document.visibilityState === "hidden");
  if (useSync) {
    sendCounterBatchSync(counters, batchTimestampMs);
  } else {
    sendCounterBatch(counters, batchTimestampMs);
  }
}

function flushAll(): void {
  for (const queue of queues) {
    const items = queue.splice(0);
    if (items.length === 0) continue;
    flush(items, true);
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
    window.addEventListener("beforeunload", () => {
      isTearingDown = true;
      flushAll();
    });
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
  const batchSize = Math.max(1, options?.batchSize ?? DEFAULT_BATCH_SIZE);
  const batchIntervalMs = options?.batchIntervalMs ?? DEFAULT_BATCH_INTERVAL_MS;

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

  const queue: QueuedEvent[] = [];
  queues.push(queue);
  installLifecycleListeners();

  let timer: ReturnType<typeof setTimeout> | undefined;

  function scheduleFlush(): void {
    if (timer !== undefined) return;
    timer = setTimeout(() => {
      timer = undefined;
      while (queue.length > 0) {
        flush(queue.splice(0, batchSize));
      }
    }, batchIntervalMs);
  }

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

    queue.push({
      name: fullName,
      attributes: finalAttributes,
      value: resolvedValue,
      timestampMs: BigInt(Date.now()),
    });

    if (queue.length >= batchSize) {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      flush(queue.splice(0, batchSize));
    } else {
      scheduleFlush();
    }
  }

  return fireTelemetryCounter;
}

export type { Attributes, FireTelemetryCounterFn } from "../types";
