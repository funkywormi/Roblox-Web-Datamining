import type { QueueItem, ItemProcessorResult } from "@rbx/core-scripts/util/batch-request";
import dataStores from "@rbx/core-scripts/data-store";
import { transformThumbnailType } from "./thumbnailUtil";
import {
  ThumbnailStates,
  ThumbnailDataData,
  ThumbnailDataItem,
  ThumbnailQueueItem,
  ThumbnailUniverseThumbnailSize,
  Thumbnail,
  UniverseThumbnails,
} from "../constants/thumbnail2dConstant";

const { thumbnailsDataStore, gameThumbnailsDataStore } = dataStores;

interface HttpError extends Error {
  status?: number;
  message: string;
}

export class ThumbnailBatchHandler<BatchResponse, RequestQueueItem> {
  private readonly storeInstance: (
    items: QueueItem<RequestQueueItem>[],
    limit?: number,
  ) => Promise<ThumbnailDataData<BatchResponse>>;

  private readonly keySetter: (item: BatchResponse) => string;

  private readonly keyGetter: (item: QueueItem<RequestQueueItem>) => string;

  private readonly validator: (item: BatchResponse) => boolean;

  private readonly resultSetter: (item: BatchResponse, limit?: number) => ThumbnailDataItem;

  constructor(
    storeInstance: (
      items: QueueItem<RequestQueueItem>[],
      limit?: number,
    ) => Promise<ThumbnailDataData<BatchResponse>>,
    keySetter: (item: BatchResponse) => string,
    keyGetter: (item: QueueItem<RequestQueueItem>) => string,
    validator: (item: BatchResponse) => boolean,
    resultSetter: (item: BatchResponse, limit?: number) => ThumbnailDataItem,
  ) {
    // data store used to make api call
    this.storeInstance = storeInstance;
    // key used for setting results
    this.keySetter = keySetter;
    // key used for getting results
    this.keyGetter = keyGetter;
    // validate thumbnail status
    this.validator = validator;
    // sets thumbnail results
    this.resultSetter = resultSetter;
  }

  handle(items: QueueItem<RequestQueueItem>[], limit?: number): Promise<ItemProcessorResult> {
    return new Promise(resolve => {
      this.storeInstance(items, limit)
        .then((thumbnailData: ThumbnailDataData<BatchResponse>) => {
          const thumbnailResults = new Map<string, BatchResponse>();
          const results: Record<string, ThumbnailDataItem> = {};
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          const itemsData = thumbnailData?.data?.data ?? new Array<BatchResponse>();

          itemsData.forEach((item: BatchResponse) => {
            thumbnailResults.set(this.keySetter(item), item);
          });

          items.forEach((queueItem: QueueItem<RequestQueueItem>) => {
            const itemKey = this.keyGetter(queueItem);
            if (thumbnailResults.has(itemKey)) {
              const result = thumbnailResults.get(itemKey);
              if (result && this.validator(result)) {
                results[itemKey] = this.resultSetter(result, limit);
              }
            } else {
              let errorState;
              if (limit && limit > 1) {
                errorState = { thumbnails: [] };
              } else {
                errorState = {
                  thumbnail: {
                    targetId: itemKey,
                    state: ThumbnailStates.error,
                  },
                };
              }

              results[itemKey] = {
                ...errorState,
                errorcode: 3,
                errorMessage: "id doesn't exist",
              } as ThumbnailDataItem;
            }
          });

          resolve(results);
        })
        // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
        .catch((err: HttpError) => {
          if (err?.status === 503) {
            // do no retry if API is under stress
            return;
          }
          // No success cases this time, all will be retried.
          resolve({});
        });
    });
  }
}

export const batchRequestHandler = new ThumbnailBatchHandler<Thumbnail, ThumbnailQueueItem>(
  (items: QueueItem<ThumbnailQueueItem>[]) => {
    const requests = items.map(({ data: { type, ...otherData }, key }) => ({
      requestId: key,
      type: transformThumbnailType(type),
      ...otherData,
    }));

    return new Promise<ThumbnailDataData<Thumbnail>>((resolve, reject) => {
      thumbnailsDataStore
        .getBatchThumbnails(requests)
        // @ts-expect-error TODO: old, migrated code
        // Assumes data is not undefined
        .then(resolve)
        .catch(reject);
    });
  },
  (item: Thumbnail) => item.requestId ?? "",
  (item: QueueItem<ThumbnailQueueItem>) => item.key,
  (item: Thumbnail) => item.state !== ThumbnailStates.pending,
  (item: Thumbnail) => ({ thumbnail: item }),
);

export const universeThumbnailHandler = new ThumbnailBatchHandler<
  UniverseThumbnails,
  ThumbnailQueueItem
>(
  (items: QueueItem<ThumbnailQueueItem>[], limit) =>
    new Promise<ThumbnailDataData<UniverseThumbnails>>((resolve, reject) => {
      gameThumbnailsDataStore
        .getAllUniverseThumbnails(
          items.map(({ data: { targetId } }) => targetId ?? 0),
          // @ts-expect-error TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          items[0]?.data.size as ThumbnailUniverseThumbnailSize,
          items[0]?.data.format,
          items[0]?.data.isCircular,
          limit,
        )
        // @ts-expect-error TODO: old, migrated code
        // Assumes data is not undefined
        .then(resolve)
        .catch(reject);
    }),

  (item: UniverseThumbnails) => item.universeId.toString(),
  (item: QueueItem<ThumbnailQueueItem>) =>
    item.data.targetId ? item.data.targetId.toString() : "",
  (item: UniverseThumbnails) => !item.error,
  (result: UniverseThumbnails, limit) =>
    limit === 1 ? { thumbnail: result.thumbnails[0] } : { thumbnails: result.thumbnails },
);
