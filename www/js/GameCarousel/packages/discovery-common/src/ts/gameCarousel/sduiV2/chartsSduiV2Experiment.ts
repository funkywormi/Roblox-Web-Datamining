import { useEffect } from "react";
import ExperimentationService from "@rbx/experimentation";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import { chartsSduiV2ExposureSession } from "./chartsSduiV2ExposureSession";

/* One flag gates the whole Charts SDUI v2 migration: See All + main `/charts`. */
export const chartsSduiV2Layer = "Website.Charts.SduiV2";
export const isChartsSduiV2EnabledParam = "IsChartsSduiV2Enabled";

type ChartsSduiV2ExperimentValues = {
  [isChartsSduiV2EnabledParam]: boolean;
};

const defaultValues: ChartsSduiV2ExperimentValues = {
  [isChartsSduiV2EnabledParam]: false,
};

/** Reads the IXP flag gating the Charts SDUI v2 migration; defaults to disabled. */
const useIsChartsSduiV2Enabled = (
  shouldLogExposure = true,
): { isEnabled: boolean; isLoading: boolean } => {
  const { ixpData, isLoading } = useExperimentValues<ChartsSduiV2ExperimentValues>(
    chartsSduiV2Layer,
    defaultValues,
  );

  const isEnabled = ixpData[isChartsSduiV2EnabledParam] === true;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (shouldLogExposure && !chartsSduiV2ExposureSession.hasLogged) {
      chartsSduiV2ExposureSession.hasLogged = true;
      try {
        ExperimentationService.logLayerExposure(chartsSduiV2Layer);
      } catch {
        // Exposure logging is best-effort and must never block rendering.
      }
    }
  }, [shouldLogExposure, isLoading]);

  return {
    isEnabled,
    isLoading,
  };
};

export default useIsChartsSduiV2Enabled;
