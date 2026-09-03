import type {
  BatchItemProcessor,
  BatchRequestProperties,
  BatchRequestProcessor,
} from "@rbx/core-scripts/util/batch-request";
import BatchRequestFactory from "@rbx/core-scripts/util/batch-request";
import { logMeasurement } from "../metrics";
import { getThumbnailMetaData } from "../services/thumbnailMetaData";
import { getCachePropertiesFromMetaData, shouldLogMetrics } from "./thumbnailUtil";
import {
  ThumbnailTypes,
  DefaultBatchSize,
  ThumbnailCooldown,
  BatchRequestError,
  ThumbnailRequesters,
  ThumbnailDataItem,
  MetaData,
  ThumbnailQueueItem,
  CustomThumbnailQueueItem,
  Thumbnail,
} from "../constants/thumbnail2dConstant";

export class ThumbnailRequester<QueueItem> {
  private readonly batchRequestFactory: BatchRequestFactory<QueueItem, ThumbnailDataItem>;

  private readonly thumbnailProcessorKeySerializer: (item: QueueItem) => string;

  private readonly thumbnailItemIdSerializer: (item: QueueItem) => string;

  private thumbnailRequesters: ThumbnailRequesters<QueueItem, ThumbnailDataItem> = {};

  constructor(
    thumbnailItemIdSerializer: (item: QueueItem) => string,
    thumbnailProcessorKeySerializer: (item: QueueItem) => string,
  ) {
    this.batchRequestFactory = new BatchRequestFactory<QueueItem, ThumbnailDataItem>();
    this.thumbnailItemIdSerializer = thumbnailItemIdSerializer;
    this.thumbnailProcessorKeySerializer = thumbnailProcessorKeySerializer;
  }

  getThumbnailRequesterProperties(metaData?: MetaData): BatchRequestProperties {
    if (!metaData)
      return {
        getFailureCooldown: this.batchRequestFactory.createExponentialBackoffCooldown(
          ThumbnailCooldown.minCooldown,
          ThumbnailCooldown.maxCooldown,
        ),
        maxRetryAttempts: ThumbnailCooldown.maxRetryAttempts,
        batchSize: DefaultBatchSize,
      };
    return {
      getFailureCooldown: this.batchRequestFactory.createExponentialBackoffCooldown(
        metaData.requestMinCooldown,
        metaData.requestMaxCooldown,
      ),
      maxRetryAttempts: metaData.requestMaxRetryAttempts,
      batchSize: metaData.requestBatchSize,
      concurrentRequestCount: metaData.concurrentThumbnailRequestCount,
      processBatchWaitTime: 1000,
    };
  }

  getThumbnailRequester(
    thumbnailRequestProcessor: BatchItemProcessor<QueueItem>,
    thumbnailRequesterKey: string,
    metaData?: MetaData,
  ): BatchRequestProcessor<QueueItem, ThumbnailDataItem> {
    const thumbnailRequester = this.thumbnailRequesters[thumbnailRequesterKey];
    if (thumbnailRequester) {
      return thumbnailRequester;
    }
    const processor = this.batchRequestFactory.createRequestProcessor(
      thumbnailRequestProcessor,
      item => this.thumbnailItemIdSerializer(item),
      this.getThumbnailRequesterProperties(metaData),
    );
    this.thumbnailRequesters[thumbnailRequesterKey] = processor;
    return processor;
  }

  processThumbnailBatchRequest(
    item: QueueItem & { type: string },
    thumbnailRequestProcessor: BatchItemProcessor<QueueItem>,
    thumbnailRequesterKey: string = this.thumbnailProcessorKeySerializer(item),
    clearCachedValue?: boolean,
  ): Promise<ThumbnailDataItem> {
    const { type = "custom" } = item;
    const metaData = getThumbnailMetaData();
    const batchRequester = this.getThumbnailRequester(
      thumbnailRequestProcessor,
      thumbnailRequesterKey,
      metaData,
    );
    if (clearCachedValue) {
      batchRequester.invalidateItem(item);
    }

    const cacheProperties = getCachePropertiesFromMetaData(metaData);
    return (
      batchRequester
        .queueItem(item, undefined, cacheProperties)
        .then((data: ThumbnailDataItem) => {
          if (data.performance && shouldLogMetrics(metaData)) {
            const { thumbnails, thumbnail } = data;
            const logMetrics = (thumb: Thumbnail) => {
              logMeasurement("ThumbnailStatusCountWebapp", {
                ThumbnailType: `${type}_2d`,
                Status: thumb.state,
                Version: thumb.version,
              }).catch((e: unknown) => {
                console.error(e);
              });
            };
            if (thumbnail) {
              logMetrics(thumbnail);
            }
            if (thumbnails) {
              thumbnails.forEach(logMetrics);
            }
          }
          return data;
        })
        // TODO: old, migrated code
        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
        .catch((error: BatchRequestError) => {
          console.error({ error });
          if (shouldLogMetrics(metaData) && error === BatchRequestError.maxAttemptsReached) {
            logMeasurement("ThumbnailTimeoutWebapp", {
              ThumbnailType: `${type}_2d`,
            }).catch((e: unknown) => {
              console.error(e);
            });
          }

          // chain the rejection so that other listeners get triggered.
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          return Promise.reject(error);
        })
    );
  }
}

function defaultThumbnailProcessorKeySerializer({
  targetId = 0,
  token,
  type,
  size,
  format,
  isCircular,
  version = 0,
  headShape,
  includeBackground = false,
  includeProfileFrame = false,
}: ThumbnailQueueItem): string {
  return `${targetId.toString()}:${token}:${type}:${size}:${format}:${
    isCircular ? "circular" : "regular"
  }:${version}:${headShape ?? ""}:${includeBackground}:${includeProfileFrame}`;
}

export const defaultThumbnailRequester = new ThumbnailRequester<ThumbnailQueueItem>(
  (item: ThumbnailQueueItem) => {
    const { type, targetId = 0 } = item;
    if (type === ThumbnailTypes.universeThumbnail || type === ThumbnailTypes.universeThumbnails) {
      return targetId.toString();
    }
    return defaultThumbnailProcessorKeySerializer(item);
  },
  defaultThumbnailProcessorKeySerializer,
);

export const customThumbnailRequester = new ThumbnailRequester<CustomThumbnailQueueItem>(
  (item: CustomThumbnailQueueItem) => item.key,
  () => "customThumbnailRequester",
);
