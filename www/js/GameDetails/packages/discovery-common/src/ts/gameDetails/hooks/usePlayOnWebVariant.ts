import { useEffect, useRef, useState } from "react";
import {
  PlayOnWebVariant,
  type TPlayOnWebVariant,
  usePlayabilityStatus,
} from "@rbx/game-play-button";
import ExperimentationService from "@rbx/experimentation";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { cachedMeetsRequiredSpec, isSupportedBrowserAndDevice } from "@rbx/device-probe/client";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import experimentConstants from "../../common/constants/experimentConstants";

const { layerNames, defaultValues } = experimentConstants;
const deviceMeta = getDeviceMeta();
export const onSupportedBrowserAndDevice = isSupportedBrowserAndDevice();
// Desktop and mobile roll out on separate IXP layers.
const playInBrowserLayer = deviceMeta?.isDesktop ? "playInBrowserDesktop" : "playInBrowserMobile";

const playOnWebVariants = new Set<string>(Object.values(PlayOnWebVariant));
const isPlayOnWebVariant = (value: string): value is TPlayOnWebVariant =>
  playOnWebVariants.has(value);

// The device probe's stored answer, read once at mount so it can't change during the page view.
// The probe runs elsewhere; `null` means it hasn't stored an answer yet.
export const useStoredAnswer = (): boolean | null => {
  const [storedAnswer] = useState(() =>
    onSupportedBrowserAndDevice ? cachedMeetsRequiredSpec() : null,
  );
  return storedAnswer;
};

/**
 * The Play on Web variant to show for this universe, or `None`. `deviceEligible` is the live
 * device check's answer, for a page that waits on it (`useDeviceCheck`); without it, only the
 * answer stored at load decides, so the button never appears mid-page.
 */
export const usePlayOnWebVariant = (
  universeId: string,
  enabled = true,
  deviceEligible?: boolean,
): { playOnWebVariant: TPlayOnWebVariant; isLoading: boolean } => {
  const { playabilityStatus } = usePlayabilityStatus(universeId, enabled);
  const { ixpData, isLoading } = useExperimentValues(
    layerNames[playInBrowserLayer],
    defaultValues[playInBrowserLayer],
    { enabled },
  );
  const storedAnswer = useStoredAnswer();
  const meetsSpec = deviceEligible ?? storedAnswer === true;
  const eligibleForPlayOnWeb =
    enabled &&
    !isLoading &&
    (ixpData.ForcePlayOnWeb || meetsSpec) &&
    playabilityStatus === "Playable";
  // Forced (QA) sessions aren't logged as exposure.
  const shouldLogExposure = eligibleForPlayOnWeb && !ixpData.ForcePlayOnWeb;
  const hasLoggedExposure = useRef(false);
  useEffect(() => {
    if (shouldLogExposure && !hasLoggedExposure.current) {
      hasLoggedExposure.current = true;
      try {
        ExperimentationService.logLayerExposure(layerNames[playInBrowserLayer]);
      } catch {
        // Exposure logging is best-effort and must never block rendering.
      }
    }
  }, [shouldLogExposure]);

  return {
    playOnWebVariant:
      eligibleForPlayOnWeb && isPlayOnWebVariant(ixpData.PlayOnWebVariant)
        ? ixpData.PlayOnWebVariant
        : PlayOnWebVariant.None,
    // If playability status is determined to not be playable we no longer need to wait.
    isLoading:
      enabled && isLoading && (playabilityStatus === undefined || playabilityStatus === "Playable"),
  };
};
