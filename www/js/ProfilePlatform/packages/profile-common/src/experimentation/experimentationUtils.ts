import { useEffect, useState } from "react";
import ExperimentationService from "@rbx/experimentation";

enum ExperimentationLayer {
  SocialProfile = "Social.Profile",
}

/**
 * Experiment keys. These need to match IXP's keys exactly.
 */
enum ExperimentKey {
  PlaceholderKey = "placeholder_key", // this exists to keep typescript happy when there are no active experiments
  IsWebUserProfileFavoritesRedesignEnabled = "isWebUserProfileFavoritesRedesignEnabled",
  IsIARCProfileRedesignEnabled = "isIARCProfileRedesignEnabled",
  IsCurrentlyPlayingCardClickableEnabled = "isCurrentlyPlayingCardClickableEnabled",
  WebPlayerBadgesRedesign = "isWebPlayerBadgesRedesignEnabled",
  IsWebProfileBackgroundEnabled = "isWebProfileBackgroundEnabled",
}

enum CacheKeyVariant {
  FullLayer = "FullLayer",
  SingleExperiment = "SingleExperiment",
}

function getCurrentUserId() {
  return window.Roblox.CurrentUser?.userId ?? 0;
}

function generateCacheKey(variant: CacheKeyVariant, layerName: string, key = "") {
  const userId = getCurrentUserId();
  const date = new Date().toDateString();
  const version = "v1";
  switch (variant) {
    case CacheKeyVariant.FullLayer:
      return `${layerName}_${userId}_${date}_${version}`;
    case CacheKeyVariant.SingleExperiment:
      return `${layerName}_${key}_${userId}_${date}_${version}`;
  }
}

/**
 * Checks if the user is in the treatment group for a given experiment layer and key.
 * It expects a basic experiment definition with a single boolean value for the control and treatment groups.
 * It uses a local cache to provide immediate feedback and gracefully handle errors, particularly 429 errors.
 *
 * @example
 * ```tsx
 * const [isInTreatment, setIsInTreatment] = useState<boolean | null>(null);
 * useEffect(() => {
 *   const { cachedValue, promise } = isInTreatmentGroupWithLocalCache(layerName, key);
 *   setIsInTreatment(cachedValue);
 *   // eslint-disable-next-line @typescript-eslint/no-floating-promises
 *   promise.then(inTreatment => {
 *     setIsInTreatment(inTreatment);
 *   });
 * }, []);
 * ```
 *
 * @param layerName - The name of the experiment layer.
 * @param key - The key within the experiment layer to check for treatment.
 * @param mockValue - Optional mock value to return instead of making the actual experiment call.
 * @returns An object containing the cached value and a promise that resolves to the treatment status.
 */
function isInTreatmentGroupWithLocalCache(layerName: string, key: string, mockValue?: boolean) {
  // If mock value is provided, return it immediately without making any API calls
  if (mockValue !== undefined) {
    return {
      cachedValue: mockValue,
      promise: Promise.resolve(mockValue),
    };
  }

  const localCacheKey = generateCacheKey(CacheKeyVariant.SingleExperiment, layerName, key);
  const cachedValue = sessionStorage.getItem(localCacheKey) === "true";

  const promise = (async () => {
    try {
      const ixpResult = await ExperimentationService.getAllValuesForLayer(layerName);
      const isInTreatment = ixpResult[key] === true;
      sessionStorage.setItem(localCacheKey, isInTreatment.toString());
      return isInTreatment;
    } catch (error) {
      console.error(error);
      return cachedValue;
    }
  })();

  return {
    cachedValue,
    promise,
  };
}

/**
 * A convenience wrapper around isInTreatmentGroupWithLocalCache that immediately calls the callback
 * with the cached value and then calls it again when the promise resolves with the fresh value.
 * This simplifies the common pattern of using cached values for immediate feedback while fetching fresh data.
 *
 * @example
 * ```tsx
 * const [isInTreatment, setIsInTreatment] = useState<boolean | null>(null);
 * useEffect(() => {
 *   setTreatmentGroupWithLocalCache(layerName, key, setIsInTreatment);
 * }, []);
 * ```
 *
 * @param layerName - The name of the experiment layer.
 * @param key - The key within the experiment layer to check for treatment.
 * @param onValue - Callback function that receives the treatment status (called twice: once with cached value, once with fresh value).
 * @param mockValue - Optional mock value to return instead of making the actual experiment call.
 */
function setTreatmentGroupWithLocalCache(
  layerName: string,
  key: string,
  onValue: (value: boolean) => void,
  mockValue?: boolean,
) {
  const { cachedValue, promise } = isInTreatmentGroupWithLocalCache(layerName, key, mockValue);
  onValue(cachedValue);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  promise.then(inTreatment => {
    onValue(inTreatment);
  });
}

/**
 * A convenience hook wrapper around setTreatmentGroupWithLocalCache.
 *
 * @example
 * ```tsx
 * const isInTreatment = useIsInTreatmentWithLocalCache(layerName, key);
 * const isInTreatmentMocked = useIsInTreatmentWithLocalCache(layerName, key, true);
 * ```
 *
 * @param layerName - The name of the experiment layer.
 * @param key - The key within the experiment layer to check for treatment.
 * @param mockValue - Optional mock value to return instead of making the actual experiment call.
 */
function useIsInTreatmentWithLocalCache(
  layerName: string,
  key: string,
  mockValue?: boolean,
): boolean | null {
  const [isInTreatment, setIsInTreatment] = useState<boolean | null>(null);
  useEffect(() => {
    setTreatmentGroupWithLocalCache(layerName, key, setIsInTreatment, mockValue);
  }, [layerName, key, mockValue]);

  return isInTreatment;
}

/**
 * Supported experiment value types.
 */
type ExperimentValue = boolean | string | number | object;

/**
 * A hook that fetches all values for a layer once and provides a type-safe method to get experiment values.
 * This is optimized for scenarios where multiple experiment checks are needed from the same layer.
 *
 * @example
 * ```tsx
 * type Experiments = {
 *   isWebProfileHeaderRedesignEnabled: boolean;
 *   isWebStoreEnabled: boolean;
 *   featureName: string;
 *   maxItems: number;
 * };
 *
 * const { getValue } = useLayerTreatments<Experiments>("Social.Profile");
 * const headerRedesign = getValue("isWebProfileHeaderRedesignEnabled"); // boolean | null
 * const storeName = getValue("featureName"); // string | null
 * ```
 *
 * @param layerName - The name of the experiment layer.
 * @param mockValues - Optional mock values to return instead of making the actual experiment call.
 * @returns An object with a getValue function that retrieves values with proper typing.
 */
function useLayerTreatments<TSchema extends Record<string, ExperimentValue>>(
  layerName: string,
  mockValues?: Partial<TSchema>,
): { getValue: <K extends keyof TSchema>(key: K) => TSchema[K] | null } {
  const [layerValues, setLayerValues] = useState<Partial<TSchema> | null>(null);

  useEffect(() => {
    // If mock values are provided, use them immediately
    if (mockValues !== undefined) {
      setLayerValues(mockValues);
      return;
    }

    const localCacheKey = generateCacheKey(CacheKeyVariant.FullLayer, layerName);

    // Try to get cached layer values
    const cachedData = sessionStorage.getItem(localCacheKey);
    if (cachedData) {
      try {
        const parsed: unknown = JSON.parse(cachedData);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          setLayerValues(parsed as Partial<TSchema>);
        }
      } catch (error) {
        console.error("Failed to parse cached layer values:", error);
      }
    }

    // Fetch fresh layer values via fire and forget
    (async () => {
      const ixpResult = await ExperimentationService.getAllValuesForLayer(layerName);
      sessionStorage.setItem(localCacheKey, JSON.stringify(ixpResult));
      // Type assertion is safe here as we're storing the raw IXP response which matches our schema contract
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      setLayerValues(ixpResult as Partial<TSchema>);
    })().catch((error: unknown) => {
      console.error(error);
      // Keep using cached values if available
    });
  }, [layerName, mockValues]);

  const getValue = <K extends keyof TSchema>(key: K): TSchema[K] | null => {
    if (layerValues === null) return null;
    const value = layerValues[key];
    return value !== undefined ? (value as TSchema[K]) : null;
  };

  return { getValue };
}

export { useIsInTreatmentWithLocalCache, useLayerTreatments, ExperimentKey, ExperimentationLayer };
