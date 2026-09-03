import { QueueItem } from "@rbx/core-scripts/util/batch-request";
import { defaultThumbnailRequester } from "../util/thumbnailRequester";
import { batchRequestHandler, universeThumbnailHandler } from "../util/thumbnailHandler";
import {
  isAvatarHeadshotBackgroundInTreatmentFromCache,
  prefetchAvatarHeadshotBackgroundExperiment,
  resolveAvatarHeadshotIncludeBackground,
} from "../experimentation/avatarHeadshotBackgroundExperiment";
import {
  ThumbnailTypes,
  ThumbnailStates,
  ThumbnailAssetsSize,
  ThumbnailGameIconSize,
  ThumbnailGamePassIconSize,
  ThumbnailGameThumbnailSize,
  ThumbnailUniverseThumbnailSize,
  ThumbnailGroupIconSize,
  ThumbnailBadgeIconSize,
  ThumbnailDeveloperProductIconSize,
  ThumbnailAvatarsSize,
  ThumbnailFormat,
  ThumbnailAvatarHeadshotSize,
  ThumbnailQueueItem,
} from "../constants/thumbnail2dConstant";

const WEBP_SUPPORT_DATA_URI =
  "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==";

let isWebPSupportedPromise: Promise<boolean> | undefined;

const isWebPSupported = () => {
  if (isWebPSupportedPromise === undefined) {
    isWebPSupportedPromise = new Promise(resolve => {
      try {
        const img = new Image();
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = WEBP_SUPPORT_DATA_URI;
      } catch (_error) {
        resolve(true);
      }
    });
  }

  return isWebPSupportedPromise;
};

// Test for WebP support at runtime, as we still support MacOS 10.x which doesn't support WebP.
const resolveThumbnailFormat = (format: ThumbnailFormat): Promise<ThumbnailFormat> => {
  if (format !== ThumbnailFormat.webp) {
    return Promise.resolve(format);
  }

  return isWebPSupported().then(isSupported =>
    isSupported ? ThumbnailFormat.webp : ThumbnailFormat.png,
  );
};

type ThumbnailSize =
  | ThumbnailAssetsSize
  | ThumbnailGameIconSize
  | ThumbnailGameThumbnailSize
  | ThumbnailUniverseThumbnailSize
  | ThumbnailGamePassIconSize
  | ThumbnailAvatarsSize
  | ThumbnailAvatarHeadshotSize
  | ThumbnailGroupIconSize
  | ThumbnailBadgeIconSize
  | ThumbnailDeveloperProductIconSize;

type ResolvedThumbnail = { state: ThumbnailStates; imageUrl: string };

// In-memory mirror of resolved thumbnail URLs, keyed by the caller's request params (not the
// internally webp-resolved format), so a remounted Thumbnail2d can seed its first render
// synchronously and skip the loading shimmer for an already-loaded target. Only Completed
// thumbnails are stored; Pending/blocked results re-resolve on the next mount.
const resolvedThumbnailCache = new Map<string, ResolvedThumbnail>();

const serializeSeedKey = (
  thumbnailType: ThumbnailTypes,
  size: ThumbnailSize,
  format: ThumbnailFormat,
  targetId?: number,
  token?: string,
  version?: number,
  headShape?: string,
  includeBackground?: boolean,
  includeProfileFrame = false,
): string =>
  [
    thumbnailType,
    size,
    format,
    targetId ?? "",
    token ?? "",
    version ?? "",
    headShape ?? "",
    includeBackground ? "bg" : "",
    includeProfileFrame ? "frame" : "",
  ].join(":");

const loadThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string,
  clearCachedValue?: boolean,
  version?: number,
  headShape?: string,
  includeBackground?: boolean,
  includeProfileFrame = false,
) => {
  if (!targetId && !token) {
    return new Promise((_resolve, reject) => {
      reject(new Error("TargetId or token can not be empty."));
    });
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!thumbnailType) {
    return new Promise((_resolve, reject) => {
      reject(new Error("ThumbnailType can not be empty."));
    });
  }

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-param-reassign
  format ??= ThumbnailFormat.webp;

  // Temp solution to override game icon request format for security purpose
  let formatOverride = format;
  if (
    thumbnailType === ThumbnailTypes.gameIcon ||
    thumbnailType === ThumbnailTypes.gameThumbnail ||
    thumbnailType === ThumbnailTypes.placeGameIcon ||
    thumbnailType === ThumbnailTypes.universeThumbnail
  ) {
    formatOverride = ThumbnailFormat.webp;
  }

  // Warm the treatment cache (single-flight) only when an AvatarHeadshot might
  // rely on the experiment, so headshot-less pages issue no IXP request.
  if (thumbnailType === ThumbnailTypes.avatarHeadshot && includeBackground === undefined) {
    prefetchAvatarHeadshotBackgroundExperiment();
  }

  const resolvedIncludeBackground = resolveAvatarHeadshotIncludeBackground(
    thumbnailType,
    includeBackground,
    isAvatarHeadshotBackgroundInTreatmentFromCache(),
  );

  return resolveThumbnailFormat(formatOverride).then((resolvedFormat: ThumbnailFormat) => {
    const item = {
      targetId,
      token,
      type: thumbnailType,
      format: resolvedFormat,
      size,
      version,
      headShape,
      // Only include the param when enabled so the request omits it for the default case.
      ...(resolvedIncludeBackground ? { includeBackground: true } : {}),
      ...(includeProfileFrame ? { includeProfileFrame } : {}),
    };

    const customHandler = [ThumbnailTypes.universeThumbnails, ThumbnailTypes.universeThumbnail];
    // null requesterKey creates new batch request processor.
    const requesterKey = !customHandler.includes(thumbnailType)
      ? "thumbnail2dProcessor"
      : "universeThumbnailProcessor";
    return defaultThumbnailRequester
      .processThumbnailBatchRequest(
        item,
        (items: QueueItem<ThumbnailQueueItem>[]) => {
          if (thumbnailType === ThumbnailTypes.universeThumbnail) {
            return universeThumbnailHandler.handle(items, 1);
          }

          if (thumbnailType === ThumbnailTypes.universeThumbnails) {
            return universeThumbnailHandler.handle(items, 10);
          }

          return batchRequestHandler.handle(items);
        },
        requesterKey,
        clearCachedValue,
      )
      .then(result => {
        // Non-throwing read: this runs for every thumbnail consumer, so it must never turn a
        // resolved request into a rejection regardless of the result shape.
        const thumbnail = (result as { thumbnail?: Partial<ResolvedThumbnail> } | undefined)
          ?.thumbnail;
        if (thumbnail?.state === ThumbnailStates.complete && thumbnail.imageUrl) {
          resolvedThumbnailCache.set(
            serializeSeedKey(
              thumbnailType,
              size,
              format,
              targetId,
              token,
              version,
              headShape,
              includeBackground,
              includeProfileFrame,
            ),
            { state: thumbnail.state, imageUrl: thumbnail.imageUrl },
          );
        }
        return result;
      });
  });
};

const getThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string,
  version?: number,
  headShape?: string,
  includeBackground?: boolean,
  includeProfileFrame = false,
) =>
  loadThumbnailImage(
    thumbnailType,
    size,
    format,
    targetId,
    token,
    false,
    version,
    headShape,
    includeBackground,
    includeProfileFrame,
  );

const reloadThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size:
    | ThumbnailAssetsSize
    | ThumbnailGameIconSize
    | ThumbnailGameThumbnailSize
    | ThumbnailUniverseThumbnailSize
    | ThumbnailGamePassIconSize
    | ThumbnailAvatarsSize
    | ThumbnailAvatarHeadshotSize
    | ThumbnailGroupIconSize
    | ThumbnailBadgeIconSize
    | ThumbnailDeveloperProductIconSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string,
  version?: number,
  headShape?: string,
  includeBackground?: boolean,
  includeProfileFrame = false,
) =>
  loadThumbnailImage(
    thumbnailType,
    size,
    format,
    targetId,
    token,
    true,
    version,
    headShape,
    includeBackground,
    includeProfileFrame,
  );

const getCssClass = (thumbnailState: ThumbnailStates) => ({
  "icon-broken": thumbnailState === ThumbnailStates.error,
  "icon-in-review": thumbnailState === ThumbnailStates.inReview,
  "icon-blocked": thumbnailState === ThumbnailStates.blocked,
  "icon-pending": thumbnailState === ThumbnailStates.pending,
});

// Synchronous read of a previously-resolved thumbnail (see resolvedThumbnailCache). Returns undefined
// on a miss. Used by Thumbnail2d to seed its initial render when `seedFromCache` is set.
const peekThumbnailImage = (
  thumbnailType: ThumbnailTypes,
  size: ThumbnailSize,
  format: ThumbnailFormat = ThumbnailFormat.webp,
  targetId?: number,
  token?: string,
  version?: number,
  headShape?: string,
  includeBackground?: boolean,
  includeProfileFrame = false,
): ResolvedThumbnail | undefined =>
  resolvedThumbnailCache.get(
    serializeSeedKey(
      thumbnailType,
      size,
      format,
      targetId,
      token,
      version,
      headShape,
      includeBackground,
      includeProfileFrame,
    ),
  );

export { getThumbnailImage, getCssClass, reloadThumbnailImage, peekThumbnailImage };
