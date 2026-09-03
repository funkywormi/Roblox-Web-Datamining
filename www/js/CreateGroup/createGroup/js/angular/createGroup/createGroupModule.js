import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

let createGroup = angular
  .module('createGroup', [
    'createGroupTemplates',
    'groups',
    'modal',
    'systemFeedback',
    'fileUpload'
  ])
  .config([
    'languageResourceProvider',
    function (languageResourceProvider) {
      const translationProvider = new TranslationResourceProvider();
      const featureGroupsResources = translationProvider.getTranslationResource('Feature.Groups');
      languageResourceProvider.setTranslationResources([featureGroupsResources]);
    }
  ]);

export default createGroup;
