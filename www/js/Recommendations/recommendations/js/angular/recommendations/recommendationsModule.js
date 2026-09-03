import angular from 'angular';
import { TranslationResourceProvider } from 'Roblox';

const recommendations = angular
  .module('recommendations', [
    'robloxApp',
    'thumbnails',
    'recommendationsAppTemplates',
    'resellers'
  ])
  .config([
    'languageResourceProvider',
    languageResourceProvider => {
      const translationProvider = new TranslationResourceProvider();
      const featureRecommendationsResources = translationProvider.getTranslationResource(
        'Feature.Recommendations'
      );
      languageResourceProvider.setTranslationResources([featureRecommendationsResources]);
    }
  ]);

export default recommendations;
