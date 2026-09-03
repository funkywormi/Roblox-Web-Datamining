import angular from 'angular';
import { TranslationResourceProvider } from 'Roblox';

let socialLinksConfiguration = angular.module("socialLinksConfiguration", ["robloxApp", "socialLinksCommon", "socialLinksConfigurationHtmlTemplateApp", "systemFeedback"])
    .config(["languageResourceProvider", function (languageResourceProvider) {
        const translationProvider = new TranslationResourceProvider();
        const featurePromotedChannelsResources = translationProvider.getTranslationResource('Feature.PromotedChannels');
        languageResourceProvider.setTranslationResources([featurePromotedChannelsResources]);
    }]);

export default socialLinksConfiguration; 