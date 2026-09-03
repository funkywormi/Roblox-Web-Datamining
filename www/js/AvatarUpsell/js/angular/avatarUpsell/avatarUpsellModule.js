import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const avatarUpsell = angular.module('avatarUpsell', ['robloxApp', 'thumbnails']).config([
  '$compileProvider',
  '$injector',
  function($compileProvider, $injector) {
    // need to whitelist "intent:" url for android.
    const languageResourceProvider = $injector.get('languageResourceProvider');
    const translationProvider = new TranslationResourceProvider();

    const featureAvatarResources = translationProvider.getTranslationResource('Feature.Avatar');
    languageResourceProvider.setTranslationResources([featureAvatarResources]);

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|intent|robloxmobile):/);
  }
]);

export default avatarUpsell;
