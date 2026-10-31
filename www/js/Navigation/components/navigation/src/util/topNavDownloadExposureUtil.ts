import ExperimentationService from "@rbx/experimentation";

export const DOWNLOAD_FUNNEL_LAYER_NAME = "Website.DownloadFunnel";

let hasLoggedExposure = false;

// The layer allocates on exposure, so both arms log once the button could appear.
// logLayerExposure needs the layer's enrollment metadata registered by a preceding values call, and
// no-ops for unassigned units.
export const logTopNavDownloadExposure = async (): Promise<void> => {
  if (hasLoggedExposure) {
    return;
  }
  hasLoggedExposure = true;
  try {
    await ExperimentationService.getAllValuesForLayer(DOWNLOAD_FUNNEL_LAYER_NAME);
    ExperimentationService.logLayerExposure(DOWNLOAD_FUNNEL_LAYER_NAME);
  } catch {
    hasLoggedExposure = false;
  }
};
