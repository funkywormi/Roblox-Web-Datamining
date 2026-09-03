import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

let premium = angular
    .module("premium", ["robloxApp"])
    .config(['languageResourceProvider', function (languageResourceProvider) {
        const translationProvider = new TranslationResourceProvider();
        const premiumResources = translationProvider.getTranslationResource('Feature.Premium');
        languageResourceProvider.setTranslationResources([premiumResources]);
    }]);

export default premium;