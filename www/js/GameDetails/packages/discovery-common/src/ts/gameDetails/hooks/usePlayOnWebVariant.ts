import { useEffect, useRef } from "react";
import {
  PlayOnWebVariant,
  type TPlayOnWebVariant,
  usePlayabilityStatus,
} from "@rbx/game-play-button";
import { currentBrowser, Browser } from "@rbx/core-scripts/util/current-browser";
import ExperimentationService from "@rbx/experimentation";
import { getDeviceMeta, isMac, isWindows } from "@rbx/core-scripts/meta/device";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import experimentConstants from "../../common/constants/experimentConstants";

const { layerNames, defaultValues } = experimentConstants;
const SUPPORTED_BROWSERS = [Browser.Chrome];
const browser = currentBrowser();
const onSupportedBrowser = SUPPORTED_BROWSERS.includes(browser);
const deviceMeta = getDeviceMeta();
const onSupportedDevice =
  deviceMeta !== null &&
  !deviceMeta.isInApp &&
  ((deviceMeta.isDesktop && (isWindows() || isMac())) || deviceMeta.isAndroidDevice);
// Desktop and mobile roll out on separate IXP layers.
const playInBrowserLayer = deviceMeta?.isDesktop ? "playInBrowserDesktop" : "playInBrowserMobile";

const playOnWebVariants = new Set<string>(Object.values(PlayOnWebVariant));
const isPlayOnWebVariant = (value: string): value is TPlayOnWebVariant =>
  playOnWebVariants.has(value);

export const usePlayOnWebVariant = (universeId: string): TPlayOnWebVariant => {
  const { playabilityStatus } = usePlayabilityStatus(universeId);
  const { ixpData, isLoading } = useExperimentValues(
    layerNames[playInBrowserLayer],
    defaultValues[playInBrowserLayer],
  );
  const eligibleForPlayOnWeb =
    !isLoading &&
    (ixpData.ForcePlayOnWeb || (onSupportedBrowser && onSupportedDevice)) &&
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

  if (!eligibleForPlayOnWeb || !isPlayOnWebVariant(ixpData.PlayOnWebVariant)) {
    return PlayOnWebVariant.None;
  }
  return ixpData.PlayOnWebVariant;
};
