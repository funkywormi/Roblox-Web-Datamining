import { useEffect, useState } from "react";
import ExperimentationService from "@rbx/experimentation";
import experimentConstants from "../constants/experimentConstants";

const LAYER_NAME = experimentConstants.layerNames.avatarShopRecommendationsAndSearchWeb;

type RecommendationsAndSearchWebLayer = {
  animatedItemCardEnabled?: boolean;
};

let enrollmentPromise: Promise<boolean> | undefined;
let cachedEnabled: boolean | undefined;
const listeners = new Set<(enabled: boolean) => void>();

const notify = (enabled: boolean): void => {
  cachedEnabled = enabled;
  listeners.forEach(listener => {
    listener(enabled);
  });
};

/**
 * Warm / read `animatedItemCardEnabled` once per page. Call early (page mount) so cards
 * do not wait on enrollment after first paint. Failed fetches clear the cache so a later
 * call can retry.
 */
export const prefetchAnimationItemCardHoverPreviewIxp = (): Promise<boolean> => {
  enrollmentPromise ??= ExperimentationService.getAllValuesForLayer(LAYER_NAME)
    // Catalog already enrolls + logs exposure for this layer via useAvatarEnrollments.
    // Only read the param here so we do not double-log exposure on the catalog page.
    .then((values: RecommendationsAndSearchWebLayer) => {
      const enabled = values?.animatedItemCardEnabled === true;
      notify(enabled);
      return enabled;
    })
    .catch(() => {
      enrollmentPromise = undefined;
      notify(false);
      return false;
    });
  return enrollmentPromise;
};

/** Test helper. */
export const resetAnimationItemCardHoverPreviewIxp = (): void => {
  enrollmentPromise = undefined;
  cachedEnabled = undefined;
  listeners.clear();
};

/**
 * IXP gate for 3D animation hover preview on catalog item cards
 * (`animatedItemCardEnabled` on AvatarMarketplace.RecommendationsAndSearch.Web).
 *
 * Stays false until enrollment settles (safe default). Shares one enrollment across cards.
 */
export default function useAnimationItemCardHoverPreviewIxp(): boolean {
  const [enabled, setEnabled] = useState(() => cachedEnabled === true);

  useEffect(() => {
    listeners.add(setEnabled);
    if (cachedEnabled !== undefined) {
      setEnabled(cachedEnabled);
    }
    // eslint-disable-next-line @rbx/promises/prefer-query-mutation, no-void -- one-shot IXP enroll; no mutation/cache surface here
    void prefetchAnimationItemCardHoverPreviewIxp();
    return () => {
      listeners.delete(setEnabled);
    };
  }, []);

  return enabled;
}
