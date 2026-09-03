import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const groupSearch = angular
  .module('groupSearch', [
    'robloxApp',
    'groupSearchAppHtmlTemplateApp',
    'groups',
    'cursorPagination',
    'thumbnails',
    'systemFeedback'
  ])
  .config([
    '$locationProvider',
    'languageResourceProvider',
    function ($locationProvider, languageResourceProvider) {
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });

      const translationProvider = new TranslationResourceProvider();
      const groupsResources = translationProvider.getTranslationResource('Feature.Groups');
      const controlsResources = translationProvider.getTranslationResource('CommonUI.Controls');
      languageResourceProvider.setTranslationResources([groupsResources, controlsResources]);
    }
  ]);

export default groupSearch;
