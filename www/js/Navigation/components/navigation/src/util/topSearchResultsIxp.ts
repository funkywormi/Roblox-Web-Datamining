import ExperimentationService from "@rbx/experimentation";

export const TOP_SEARCH_RESULTS_LAYER_NAME = "Website.TopSearchResultsPage.Exposure";
const TOP_SEARCH_RESULTS_PARAM_NAME = "shouldShowTopResults";
const META_NAME = "top-search-results-data";

const dataset = (): DOMStringMap | undefined =>
  document.querySelector<HTMLMetaElement>(`meta[name="${META_NAME}"]`)?.dataset;

export const getIsTopSearchResultsEnabled = (): boolean => dataset()?.enabled === "True";

let hasLoggedExposure = false;

// IXP requires the layer values to resolve with the experiment parameter before exposure is logged.
// On failure the guard is released so a later keystroke can retry.
export const logTopSearchResultsExposureOnce = (): void => {
  if (hasLoggedExposure) {
    return;
  }
  hasLoggedExposure = true;
  ExperimentationService.getAllValuesForLayer(TOP_SEARCH_RESULTS_LAYER_NAME)
    .then(data => {
      if (TOP_SEARCH_RESULTS_PARAM_NAME in data) {
        ExperimentationService.logLayerExposure(TOP_SEARCH_RESULTS_LAYER_NAME);
      }
    })
    .catch(() => {
      hasLoggedExposure = false;
    });
};
