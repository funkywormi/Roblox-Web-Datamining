import angular from 'angular';
import { TranslationResourceProvider } from 'Roblox';

const assetsExplorerConfig = (
  $stateProvider,
  $urlRouterProvider,
  $locationProvider,
  languageResourceProvider
) => {
  const translationProvider = new TranslationResourceProvider();
  const featureInventoryResources = translationProvider.getTranslationResource('Feature.Inventory');
  const commonAssetTypesResources = translationProvider.getTranslationResource('Common.AssetTypes');
  const commonUIControlsResources = translationProvider.getTranslationResource('CommonUI.Controls');
  languageResourceProvider.setTranslationResources([
    featureInventoryResources,
    commonAssetTypesResources,
    commonUIControlsResources
  ]);

  // validate url
  const loc = window.location.href;
  if (loc.indexOf('#') !== -1 && loc.indexOf('#!') === -1) {
    window.location.href = loc.replace('#', '#!');
  }
  // false mean hashbang mode
  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('!');

  const defaultCategory = (commonAssetTypesResources.get('Label.Accessories') || 'accessories').toLowerCase();
  $urlRouterProvider.otherwise(`/${defaultCategory}`);

  $stateProvider.state('category', {
    url: '/{categoryName}'
  });

  $stateProvider.state('subcategory', {
    url: '/{categoryName}/{subcategoryName}'
  });
};

const assetsExplorer = angular
  .module('assetsExplorer', [
    'robloxApp',
    'assetsExplorerAppTemplates',
    'ui.bootstrap',
    'thumbnails',
    'cursorPagination',
    'ui.router',
    'cursorPagination',
    'verticalMenu'
  ])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    'languageResourceProvider',
    assetsExplorerConfig
  ]);

export default assetsExplorer;
