import { createContext, useContext } from "react";
import ExperimentationService from "@rbx/experimentation";

const LAYER_NAME = "Website.Navigation";
const META_NAME = "top-nav-migration-data";

const dataset = (): DOMStringMap | undefined =>
  document.querySelector<HTMLMetaElement>(`meta[name="${META_NAME}"]`)?.dataset;

export const TopNavFoundationOverride = createContext<boolean | undefined>(undefined);

// Razor renders a C# bool as "True"/"False".
export const getIsTopNavFoundationEnabled = (): boolean => dataset()?.foundationEnabled === "True";

export const useIsTopNavFoundation = (): boolean =>
  useContext(TopNavFoundationOverride) ?? getIsTopNavFoundationEnabled();

const isEnrolled = (): boolean => dataset()?.foundationExperimentEnabled === "True";

// logLayerExposure is layer-scoped, and Website.Navigation carries three other params, so this is
// gated on the server's per-experiment enrollment hint.
export const logTopNavFoundationExposureIfEnrolled = (): void => {
  if (!isEnrolled()) {
    return;
  }
  ExperimentationService.getAllValuesForLayer(LAYER_NAME)
    .then(() => {
      ExperimentationService.logLayerExposure(LAYER_NAME);
    })
    .catch(() => undefined);
};
