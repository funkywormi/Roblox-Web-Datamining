import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const revenue = angular.module('revenue', ['robloxApp', 'revenueTemplates', 'thumbnails']).config([
  'languageResourceProvider',
  function (languageResourceProvider) {
    const translationProvider = new TranslationResourceProvider();
    const featureGroupsResources = translationProvider.getTranslationResource('Feature.Groups');
    const featureTransactionsResources = translationProvider.getTranslationResource(
      'Feature.Transactions'
    );
    languageResourceProvider.setTranslationResources([
      featureGroupsResources,
      featureTransactionsResources
    ]);
  }
]);

export default revenue;
