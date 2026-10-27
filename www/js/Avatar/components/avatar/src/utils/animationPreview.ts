import { useEffect, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

/** Keep in sync with the `.avatar-item-animated-thumbnail` opacity transition. */
export const ANIMATION_PREVIEW_FADE_MS = 280;

/** Long enough that a cursor sweeping across the grid doesn't mount WebGL on every card. */
export const ANIMATION_HOVER_INTENT_MS = 300;

/** Stop polling for a late Thumbnails3d external after this many attempts (~10s at 250ms). */
export const ANIMATED_THUMBNAIL_EXTERNAL_POLL_ATTEMPTS = 40;

export const prefersReducedMotion = (): boolean => {
  if (browserWindow == null || typeof browserWindow.matchMedia !== "function") {
    return false;
  }
  return browserWindow.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export type AnimationThumbnailMeta = {
  state: string;
  imageUrl?: string;
  version?: string;
};

const COMPLETED = "Completed";
const MAX_CACHE_ENTRIES = 64;

const metaCache = new Map<number, Promise<AnimationThumbnailMeta>>();

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
 * Dedupes the animated-thumbnail meta request so re-hovering a card skips the first network hop.
 * Incomplete or failed responses are evicted so the next hover retries.
 */
export const fetchAnimationThumbnailMeta = (assetId: number): Promise<AnimationThumbnailMeta> => {
  const cached = metaCache.get(assetId);
  if (cached) {
    metaCache.delete(assetId);
    metaCache.set(assetId, cached);
    return cached;
  }

  const request = http
    .get<AnimationThumbnailMeta>(
      {
        url: `${environmentUrls.thumbnailsApi}/v1/asset-thumbnail-animated`,
        withCredentials: true,
        retryable: true,
      },
      { assetId },
    )
    .then(response => {
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

/** Shape expected by `AnimatedThumbnail`'s `getThumbnailJson` prop. */
export const getAnimationThumbnailMetaRequest = (
  assetId: number,
): Promise<{ data: AnimationThumbnailMeta }> =>
  fetchAnimationThumbnailMeta(assetId).then(data => ({ data }));

export const clearAnimationThumbnailMetaCache = (): void => {
  metaCache.clear();
};

type Listener = (activeKey: string | null) => void;

let activePreviewKey: string | null = null;
const listeners = new Set<Listener>();

const notify = (): void => {
  listeners.forEach(listener => {
    listener(activePreviewKey);
  });
};

export const getActiveAnimationPreviewKey = (): string | null => activePreviewKey;

/**
 * Only one card may mount a 3D animation preview at a time, so WebGL contexts don't pile up.
 * Claiming a new key revokes the previous one; the returned release is a no-op once superseded.
 */
export const claimAnimationPreview = (key: string): (() => void) => {
  activePreviewKey = key;
  notify();
  return () => {
    if (activePreviewKey === key) {
      activePreviewKey = null;
      notify();
    }
  };
};

export const useIsActiveAnimationPreview = (key: string): boolean => {
  const [isActive, setIsActive] = useState(() => activePreviewKey === key);

  useEffect(() => {
    const listener: Listener = nextKey => {
      setIsActive(nextKey === key);
    };
    listeners.add(listener);
    setIsActive(activePreviewKey === key);
    return () => {
      listeners.delete(listener);
    };
  }, [key]);

  return isActive;
};

export const resetAnimationPreviewCoordinator = (): void => {
  activePreviewKey = null;
  listeners.clear();
};
