import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const groupPayouts = angular
  .module('groupPayouts', [
    'robloxApp',
    'groupPayoutsTemplates',
    'thumbnails',
    'groups',
    'ui.bootstrap'
  ])
  .config([
    'languageResourceProvider',
    function (languageResourceProvider) {
      const translationProvider = new TranslationResourceProvider();
      const featureGroupsResources = translationProvider.getTranslationResource('Feature.Groups');
      const authenticationTwoStepVerificationResources = translationProvider.getTranslationResource('Authentication.TwoStepVerification');
      languageResourceProvider.setTranslationResources([featureGroupsResources, authenticationTwoStepVerificationResources]);
    }
  ]);

export default groupPayouts;
