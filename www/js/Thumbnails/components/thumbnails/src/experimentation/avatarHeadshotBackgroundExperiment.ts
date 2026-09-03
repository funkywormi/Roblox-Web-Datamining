import { useEffect, useState } from "react";

/**
 * Joint web/lua IXP for baking avatar background into AvatarHeadshot thumbnails.
 * Layer + key must match the experiment definition in IXP and lua-apps.
 */
export const AVATAR_HEADSHOT_BACKGROUND_LAYER = "Avatar.AvatarExperience2";
export const AVATAR_HEADSHOT_BACKGROUND_EXPERIMENT_KEY =
  "isAvatarBackgroundInHeadshotThumbnailsEnabled";

const AVATAR_HEADSHOT_TYPE = "AvatarHeadshot";
const CACHE_VERSION = "v1";

/** The subset of ExperimentationService this module relies on. */
type ExperimentationServiceApi = {
  getAllValuesForLayer: (layerName: string) => Promise<Record<string, unknown>>;
  logLayerExposure: (layerName: string) => void;
};

/**
 * ExperimentationService is provided as a `window` external
 * (Roblox.ExperimentationService). Because @rbx/thumbnails loads on many pages
 * — some of which may not ship the service, or may load it after thumbnails —
 * we read it lazily at call time instead of snapshotting the import binding,
 * and treat its absence as "control" rather than throwing.
 */
const getExperimentationService = (): ExperimentationServiceApi | undefined =>
  (window.Roblox as { ExperimentationService?: ExperimentationServiceApi } | undefined)
    ?.ExperimentationService;

const getSessionCacheKey = (): string => {
  const userId = window.Roblox.CurrentUser?.userId ?? 0;
  return `${AVATAR_HEADSHOT_BACKGROUND_LAYER}_${AVATAR_HEADSHOT_BACKGROUND_EXPERIMENT_KEY}_${userId}_${new Date().toDateString()}_${CACHE_VERSION}`;
};

/** Sync read of cached treatment (false when unbucketed / cache miss). */
export const isAvatarHeadshotBackgroundInTreatmentFromCache = (): boolean =>
  sessionStorage.getItem(getSessionCacheKey()) === "true";

/**
 * Single-flight promise shared by every Thumbnail2d instance and the prefetch,
 * so a page with N headshots issues ONE IXP request instead of N. Reset on
 * failure so a later caller can retry.
 */
let treatmentPromise: Promise<boolean> | null = null;

/** Guards exposure to a single log per page load, regardless of headshot count. */
let exposureLogged = false;

const logExposureOnce = (): void => {
  if (exposureLogged) return;
  const service = getExperimentationService();
  if (!service) return;
  exposureLogged = true;
  // No-op unless the user is assigned to an experiment on this layer.
  service.logLayerExposure(AVATAR_HEADSHOT_BACKGROUND_LAYER);
};

/** Resolves treatment once per page, caching the promise so callers share a single IXP POST. */
const resolveTreatment = (): Promise<boolean> => {
  if (treatmentPromise) return treatmentPromise;

  const service = getExperimentationService();
  if (!service) {
    // Global unavailable on this page (yet) — behave as control without caching,
    // so a later caller can retry once the service is present.
    return Promise.resolve(false);
  }

  const pending = (async () => {
    const layerValues = await service.getAllValuesForLayer(AVATAR_HEADSHOT_BACKGROUND_LAYER);
    const inTreatment = layerValues[AVATAR_HEADSHOT_BACKGROUND_EXPERIMENT_KEY] === true;
    sessionStorage.setItem(getSessionCacheKey(), inTreatment.toString());
    return inTreatment;
  })();

  pending.catch(() => {
    // Allow a subsequent caller to retry after a failed request.
    treatmentPromise = null;
  });

  treatmentPromise = pending;
  return pending;
};

let prefetchStarted = false;

/** Test-only: clears single-flight, prefetch, and exposure state between cases. */
export const resetAvatarHeadshotBackgroundExperimentForTests = (): void => {
  treatmentPromise = null;
  prefetchStarted = false;
  exposureLogged = false;
};

/**
 * Warms sessionStorage so non-React thumbnail callers can read treatment
 * synchronously. Safe to call repeatedly — it single-flights and is a no-op
 * after the first call per page. Only call from AvatarHeadshot code paths so
 * headshot-less pages issue no IXP request.
 */
export const prefetchAvatarHeadshotBackgroundExperiment = (): void => {
  if (prefetchStarted) return;
  prefetchStarted = true;

  resolveTreatment().catch((error: unknown) => {
    console.error("Failed to prefetch avatar headshot background IXP:", error);
  });
};

/**
 * Resolves includeBackground for a thumbnail request.
 * Explicit true/false always wins; otherwise AvatarHeadshot uses IXP + cache.
 */
export const resolveAvatarHeadshotIncludeBackground = (
  thumbnailType: string,
  includeBackground: boolean | undefined,
  experimentEnabled: boolean,
): boolean => {
  if (includeBackground === true) return true;
  if (includeBackground === false) return false;
  return thumbnailType === AVATAR_HEADSHOT_TYPE && experimentEnabled;
};

/**
 * React hook for Thumbnail2d. Only AvatarHeadshot thumbnails touch IXP — all
 * other types short-circuit to avoid any network/exposure cost. AvatarHeadshot
 * instances share the single-flight request and log exposure once per page.
 */
export const useAvatarHeadshotBackgroundInTreatment = (thumbnailType: string): boolean => {
  const isAvatarHeadshot = thumbnailType === AVATAR_HEADSHOT_TYPE;
  const [isInTreatment, setIsInTreatment] = useState(() =>
    isAvatarHeadshot ? isAvatarHeadshotBackgroundInTreatmentFromCache() : false,
  );

  useEffect(() => {
    if (!isAvatarHeadshot) {
      return undefined;
    }

    let active = true;
    resolveTreatment()
      .then(inTreatment => {
        if (!active) return;
        setIsInTreatment(inTreatment);
        logExposureOnce();
      })
      .catch((error: unknown) => {
        console.error("Failed to load avatar headshot background IXP:", error);
      });

    return () => {
      active = false;
    };
  }, [isAvatarHeadshot]);

  return isInTreatment;
};
