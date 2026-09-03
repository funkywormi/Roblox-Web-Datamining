import {
  BatchRequestProperties,
  BatchIdSerializer,
  BatchItemProcessor,
  DefaultProcessBatchWaitTime,
  DefaultMaxRetryAttempts,
  DefaultCacheProperties,
  DefaultConcurrentRequestCount,
} from "./batchRequestConstants";
import { createExponentialBackoffCooldown } from "./batchRequestUtil";
import BatchRequestProcessor from "./batchRequestProcessor";

// TODO: why does this not use the other default properites from `./batchRequestConstants`?
const defaultProperties: Partial<BatchRequestProperties> = {
  processBatchWaitTime: DefaultProcessBatchWaitTime,
  maxRetryAttempts: DefaultMaxRetryAttempts,
  cacheProperties: DefaultCacheProperties,
  concurrentRequestCount: DefaultConcurrentRequestCount,
};

export default class BatchRequestFactory<T, V> {
  public readonly createExponentialBackoffCooldown = createExponentialBackoffCooldown;

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  createRequestProcessor(
    itemsProcessor: BatchItemProcessor<T>,
    itemSerializer: BatchIdSerializer<T>,
    properties: BatchRequestProperties,
  ): BatchRequestProcessor<T, V> {
    return new BatchRequestProcessor<T, V>(itemsProcessor, itemSerializer, {
      ...defaultProperties,
      ...properties,
    });
  }
}
