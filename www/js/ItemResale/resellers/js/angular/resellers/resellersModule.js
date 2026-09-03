import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const moduleConfig = function (languageResourceProvider) {
  const translationProvider = new TranslationResourceProvider();
  const catalogResources = translationProvider.getTranslationResource('Feature.Catalog');
  const privateSalesResources = translationProvider.getTranslationResource('Feature.PrivateSales');
  const itemResources = translationProvider.getTranslationResource('Feature.Item');
  const profileResources = translationProvider.getTranslationResource('Feature.Profile');
  const tradesResources = translationProvider.getTranslationResource('Feature.Trades');
  const premiumResources = translationProvider.getTranslationResource('Feature.Premium');
  languageResourceProvider.setTranslationResources([catalogResources, privateSalesResources, itemResources, profileResources, tradesResources, premiumResources]);
};

const resellers = angular
  .module('resellers', [
    'robloxApp',
    'resellersAppTemplates',
    'cursorPagination',
    'ui.bootstrap',
    'thumbnails',
    'systemFeedback'
  ])
  .config(['languageResourceProvider', moduleConfig]);

export default resellers;
