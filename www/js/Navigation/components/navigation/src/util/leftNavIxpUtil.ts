import ExperimentationService from "@rbx/experimentation";

export const LEFT_NAV_LAYER_NAME = "Website.Navigation";

let hasLoggedExposure = false;

// The mobile experiment allocates on exposure when the sidebar is opened, so both arms log here.
// logLayerExposure needs the layer's enrollment metadata registered by a preceding values call, and
// no-ops for unassigned units.
export const logLeftNavExposure = async (): Promise<void> => {
  if (hasLoggedExposure) {
    return;
  }
  hasLoggedExposure = true;
  try {
    await ExperimentationService.getAllValuesForLayer(LEFT_NAV_LAYER_NAME);
    ExperimentationService.logLayerExposure(LEFT_NAV_LAYER_NAME);
  } catch {
    hasLoggedExposure = false;
  }
};
