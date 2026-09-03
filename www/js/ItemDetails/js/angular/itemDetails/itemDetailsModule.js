import angular from 'angular';
import { TranslationResourceProvider } from 'Roblox';

const itemDetails = angular
  .module('item-details', ['robloxApp', 'itemDetailsAppTemplates', 'resellers'])
  .config([
    'languageResourceProvider',
    languageResourceProvider => {
      const translationProvider = new TranslationResourceProvider();
      const featureCatalogResources = translationProvider.getTranslationResource('Feature.Catalog');
      languageResourceProvider.setTranslationResources([featureCatalogResources]);
    }
  ]);

export default itemDetails;
