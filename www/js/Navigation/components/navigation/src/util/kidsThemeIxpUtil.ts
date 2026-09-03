import ExperimentationService from "@rbx/experimentation";

const KIDS_THEME_LAYER_NAME = "UniversalApp.KidsTheme";

const kidsThemeVariantDataset = (): DOMStringMap | null => {
  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="kids-theme-variant"]');
  return metaTag?.dataset ?? null;
};

export const isKidsThemeIxpEnabled = (): boolean => kidsThemeVariantDataset() !== null;

export const logKidsThemeExposureIfEnabled = (): void => {
  if (!isKidsThemeIxpEnabled()) {
    return;
  }
  ExperimentationService.getAllValuesForLayer(KIDS_THEME_LAYER_NAME)
    .then(() => {
      ExperimentationService.logLayerExposure(KIDS_THEME_LAYER_NAME);
    })
    .catch(() => undefined);
};
