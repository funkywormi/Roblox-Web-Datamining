import { catalogTranslations } from '../services/translationService';

// Subset of the backend RenderProperty enum the details page has copy for.
// Anything else (Invalid, HighFidelity) is filtered out before render.
export type TRenderProperty = 'AdvancedMaterials' | 'Emissive';

type TRenderPropertyTranslations = {
  // The value shown in the Attributes row, also the tooltip section header.
  label: () => string;
  // The tooltip body explaining the attribute.
  info: () => string;
};

export const renderPropertyTranslations: Record<TRenderProperty, TRenderPropertyTranslations> = {
  AdvancedMaterials: {
    label: catalogTranslations.labelAdvancedMaterials,
    info: catalogTranslations.labelPBRInfo
  },
  Emissive: {
    label: catalogTranslations.labelEmissive,
    info: catalogTranslations.labelEmissiveInfo
  }
};

export const isSupportedRenderProperty = (value: string): value is TRenderProperty =>
  Object.prototype.hasOwnProperty.call(renderPropertyTranslations, value);

export default renderPropertyTranslations;
