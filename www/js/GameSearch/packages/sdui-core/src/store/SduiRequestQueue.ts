export type IsCurrentRequest = () => boolean;

interface ConfigQueue {
  tail: Promise<void>;
  tailResult?: Promise<void>;
  tailDedupeKey?: string;
  pendingCount: number;
  operations: Set<QueueOperation>;
  latestReplacementOperations: Map<string, QueueOperation>;
}

interface QueueOperation {
  controller: AbortController;
  replacementKey?: string;
  replaced: boolean;
}

export interface EnqueueSduiRequestOptions {
  dedupeKey?: string;
  /** Cancels older work for this config only when the replacement key matches. */
  replacementKey?: string;
  signal?: AbortSignal;
}

export interface SduiRequestQueue {
  enqueue(
    configKey: string,
    run: (isCurrent: IsCurrentRequest, invalidationSignal: AbortSignal) => Promise<void>,
    options?: EnqueueSduiRequestOptions,
  ): Promise<void>;
  isInFlight(configKey: string): boolean;
  invalidate(configKey?: string): void;
}

/**
 * Serializes operations per config key while deduplicating consecutive
 * operations that explicitly share a dedupe key. A replacement key cancels
 * older work with the same key without changing the order of distinct work.
 */
export function createSduiRequestQueue(): SduiRequestQueue {
  const queues = new Map<string, ConfigQueue>();

  function getOrCreateQueue(configKey: string): ConfigQueue {
    const existing = queues.get(configKey);
    if (existing) return existing;

    const created: ConfigQueue = {
      tail: Promise.resolve(),
      pendingCount: 0,
      operations: new Set(),
      latestReplacementOperations: new Map(),
    };
    queues.set(configKey, created);
    return created;
  }

  return {
    enqueue(configKey, run, options) {
      const queue = getOrCreateQueue(configKey);
      const dedupeKey = options?.signal === undefined ? options?.dedupeKey : undefined;
      if (dedupeKey !== undefined && queue.pendingCount > 0 && queue.tailDedupeKey === dedupeKey) {
        return queue.tailResult ?? queue.tail;
      }

      const queueOperation: QueueOperation = {
        controller: new AbortController(),
        replacementKey: options?.replacementKey,
        replaced: false,
      };
      if (queueOperation.replacementKey !== undefined) {
        const replacedOperation = queue.latestReplacementOperations.get(
          queueOperation.replacementKey,
        );
        if (replacedOperation) {
          replacedOperation.replaced = true;
          replacedOperation.controller.abort();
        }
        queue.latestReplacementOperations.set(queueOperation.replacementKey, queueOperation);
      }
      queue.operations.add(queueOperation);
      const isCurrent = () => queues.get(configKey) === queue && !queueOperation.replaced;
      const operation = queue.tail.then(async () => {
        if (isCurrent() && options?.signal?.aborted !== true) {
          await run(isCurrent, queueOperation.controller.signal);
        }
      });

      queue.pendingCount += 1;
      queue.tailDedupeKey = dedupeKey;
      const trackedOperation = operation.finally(() => {
        queue.pendingCount -= 1;
        queue.operations.delete(queueOperation);
        if (
          queueOperation.replacementKey !== undefined &&
          queue.latestReplacementOperations.get(queueOperation.replacementKey) === queueOperation
        ) {
          queue.latestReplacementOperations.delete(queueOperation.replacementKey);
        }
        if (queues.get(configKey) === queue && queue.pendingCount === 0) {
          queues.delete(configKey);
        }
      });

      queue.tailResult = trackedOperation;
      queue.tail = trackedOperation.catch(() => undefined);
      return trackedOperation;
    },

    isInFlight(configKey) {
      return (queues.get(configKey)?.pendingCount ?? 0) > 0;
    },

    invalidate(configKey) {
      if (configKey !== undefined) {
        for (const operation of queues.get(configKey)?.operations ?? []) {
          operation.controller.abort();
        }
        queues.delete(configKey);
      } else {
        for (const queue of queues.values()) {
          for (const operation of queue.operations) {
            operation.controller.abort();
          }
        }
        queues.clear();
      }
    },
  };
}
