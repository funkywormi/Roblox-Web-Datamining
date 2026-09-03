import angular from 'angular';
import { TranslationResourceProvider } from 'Roblox';

const searchDropdown = angular
  .module('searchDropdown', ['searchDropdownHtmlTemplate', 'thumbnails'])
  .config([
    'languageResourceProvider',
    languageResourceProvider => {
      const translationProvider = new TranslationResourceProvider();
      const featureSearchDropdownComponentResources = translationProvider.getTranslationResource('Feature.SearchDropdownComponent');
      languageResourceProvider.setTranslationResources([featureSearchDropdownComponentResources]);
    }
  ]);

export default searchDropdown;
