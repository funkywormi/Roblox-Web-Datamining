import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const groupList = angular
  .module('groupList', [
    'robloxApp',
    'groups',
    'groupsListAppHtmlTemplateApp',
    'ui.router',
    'thumbnails'
  ])
  .config([
    'languageResourceProvider',
    languageResourceProvider => {
      const translationProvider = new TranslationResourceProvider();
      const groupsResources = translationProvider.getTranslationResource('Feature.Groups');

      languageResourceProvider.setTranslationResources([groupsResources]);
    }
  ]);

export default groupList;
