export type TConfig = {
  common: string[];
  feature: string;
};

export const translationConfig: TConfig = {
  common: [''],
  feature: 'Feature.Catalog'
};

// Feature.Item has some LEGACY translations from BEDEV1.
// Going forward, new translations should be put in Feature.Catalog
export const featureItemTranslationConfig: TConfig = {
  common: [''],
  feature: 'Feature.Item'
};
// Feature.ItemModel has some LEGACY translations from BEDEV1.
// Going forward, new translations should be put in Feature.Catalog
export const itemModelTranslationConfig: TConfig = {
  common: [''],
  feature: 'Feature.ItemModel'
};

export const featureRobloxSubscriptionTranslationConfig: TConfig = {
  common: [''],
  feature: 'Feature.RobloxSubscription'
};

export default translationConfig;
