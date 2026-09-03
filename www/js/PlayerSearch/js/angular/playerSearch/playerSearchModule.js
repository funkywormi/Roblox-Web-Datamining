import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const playerSearch = angular
  .module('playerSearch', [
    'robloxApp',
    'infiniteScroll',
    'systemFeedback',
    'cursorPagination',
    'thumbnails',
    'userProfiles',
    'presence'
  ])
  .config([
    '$locationProvider',
    'languageResourceProvider',
    function ($locationProvider, languageResourceProvider) {
      $locationProvider.html5Mode({ enabled: true, requireBase: false });

      const translationProvider = new TranslationResourceProvider();
      const featurePlayerSearchResultsResources = translationProvider.getTranslationResource(
        'Feature.PlayerSearchResults'
      );
      const globalSearchResources = translationProvider.getTranslationResource(
        'Search.GlobalSearch'
      );
      const commonUIFeaturesResources = translationProvider.getTranslationResource(
        'CommonUI.Features'
      );
      languageResourceProvider.setTranslationResources([
        featurePlayerSearchResultsResources,
        globalSearchResources,
        commonUIFeaturesResources
      ]);
    }
  ]);

export default playerSearch;
