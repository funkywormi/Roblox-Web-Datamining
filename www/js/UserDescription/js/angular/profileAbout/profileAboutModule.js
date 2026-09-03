import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const profileAbout = angular
  .module('userDescription', [
    'robloxApp',
    'profileAboutAppTemplates',
    'ui.bootstrap',
    'systemFeedback'
  ])
  .config([
    'languageResourceProvider',
    languageResourceProvider => {
      const translationProvider = new TranslationResourceProvider();
      const featureProfileResources = translationProvider.getTranslationResource('Feature.Profile');
      languageResourceProvider.setTranslationResources([featureProfileResources]);
    }
  ]);

export default profileAbout;
