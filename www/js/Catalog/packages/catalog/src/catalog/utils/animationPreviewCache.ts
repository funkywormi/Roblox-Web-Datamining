import { httpService } from "core-utilities";
import { EnvironmentUrls } from "@rbx/environment-urls";

export type TAnimationThumbnailMeta = {
  state: string;
  imageUrl?: string;
  version?: string;
};

const COMPLETED = "Completed";
const MAX_CACHE_ENTRIES = 64;

/** In-flight / resolved meta responses keyed by animation asset id. */
const metaCache = new Map<number, Promise<TAnimationThumbnailMeta>>();

const animationMetaUrl = (assetId: number): string =>
  `${EnvironmentUrls.thumbnailsApi}/v1/asset-thumbnail-animated?assetId=${assetId}`;

const trimCache = (): void => {
  while (metaCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = metaCache.keys().next().value;
    if (oldestKey === undefined) {
      return;
    }
    metaCache.delete(oldestKey);
  }
};

/**
 * Prefetch + cache the animated-thumbnail meta response so hover / pack cycling can skip the
 * first network hop when remounting or switching targetId.
 */
export const prefetchAnimationThumbnailMeta = (
  assetId: number,
): Promise<TAnimationThumbnailMeta> => {
  const cached = metaCache.get(assetId);
  if (cached) {
    // Refresh LRU order.
    metaCache.delete(assetId);
    metaCache.set(assetId, cached);
    return cached;
  }

  const request = httpService
    .get<TAnimationThumbnailMeta>({
      url: animationMetaUrl(assetId),
      withCredentials: true,
      retryable: true,
    })
    .then(response => {
      // Pending / failed thumbs should be retried on the next hover.
      if (response.data.state !== COMPLETED) {
        metaCache.delete(assetId);
      }
      return response.data;
    })
    .catch((error: unknown) => {
      metaCache.delete(assetId);
      throw error;
    });

  metaCache.set(assetId, request);
  trimCache();
  return request;
};

export const prefetchAnimationThumbnailMetas = (assetIds: number[]): void => {
  assetIds.forEach(assetId => {
    // Fire-and-forget warmup; failures are ignored because mount will retry.
    // eslint-disable-next-line @rbx/promises/prefer-query-mutation, no-void -- imperative prefetch outside React Query
    void prefetchAnimationThumbnailMeta(assetId).catch(() => undefined);
  });
};

/** Shape expected by AnimatedThumbnail → getThumbnail3dJson's custom getJson path. */
export const getAnimationThumbnailMetaRequest = (
  assetId: number,
): Promise<{ data: TAnimationThumbnailMeta }> =>
  prefetchAnimationThumbnailMeta(assetId).then(data => ({ data }));

/** Test helper. */
export const clearAnimationThumbnailMetaCache = (): void => {
  metaCache.clear();
};
