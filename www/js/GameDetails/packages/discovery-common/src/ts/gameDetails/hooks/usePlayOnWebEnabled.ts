import { useEffect, useRef } from "react";
import { isPrivatePlaytestAvailable, usePlayabilityStatus } from "@rbx/game-play-button";
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

export const usePlayOnWebEnabled = (universeId: string): boolean => {
  const { playabilityStatus, privatePlaytestInfo } = usePlayabilityStatus(universeId);
  const { ixpData, isLoading } = useExperimentValues(
    layerNames.gameDetails,
    defaultValues.gameDetails,
  );
  const eligibleForPlayOnWeb =
    onSupportedBrowser && onSupportedDevice && playabilityStatus === "Playable";
  // Playtest takes the secondary button slot ahead of Play on Web, so skip exposure when
  // Play on Web wouldn't be shown.
  const shouldLogExposure =
    eligibleForPlayOnWeb && !isPrivatePlaytestAvailable(privatePlaytestInfo);
  const hasLoggedExposure = useRef(false);
  useEffect(() => {
    if (shouldLogExposure && !isLoading && !hasLoggedExposure.current) {
      hasLoggedExposure.current = true;
      try {
        ExperimentationService.logLayerExposure(layerNames.gameDetails);
      } catch {
        // Exposure logging is best-effort and must never block rendering.
      }
    }
  }, [shouldLogExposure, isLoading]);

  return eligibleForPlayOnWeb && ixpData.IsPlayOnWebEnabled;
};
