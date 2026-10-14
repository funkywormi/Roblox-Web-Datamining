import { useEffect, useRef } from "react";
import { usePlayabilityStatus } from "@rbx/game-play-button";
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
  const { playabilityStatus } = usePlayabilityStatus(universeId);
  const { ixpData, isLoading } = useExperimentValues(
    layerNames.gameDetails,
    defaultValues.gameDetails,
  );
  const eligibleForPlayOnWeb =
    onSupportedBrowser && onSupportedDevice && playabilityStatus === "Playable";
  const hasLoggedExposure = useRef(false);
  useEffect(() => {
    if (eligibleForPlayOnWeb && !isLoading && !hasLoggedExposure.current) {
      hasLoggedExposure.current = true;
      try {
        ExperimentationService.logLayerExposure(layerNames.gameDetails);
      } catch {
        // Exposure logging is best-effort and must never block rendering.
      }
    }
  }, [eligibleForPlayOnWeb, isLoading]);

  return eligibleForPlayOnWeb && ixpData.IsPlayOnWebEnabled;
};
