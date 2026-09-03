import { TranslationResourceProvider } from 'Roblox';

let socialLinksJumbotron = angular
  .module('socialLinksJumbotron', [
    'robloxApp',
    'socialLinksCommon',
    'socialLinksJumbotronHtmlTemplateApp',
    'modal'
  ])
  .config([
    'languageResourceProvider',
    function (languageResourceProvider) {
      const translationProvider = new TranslationResourceProvider();
      const featurePromotedChannelsResources = translationProvider.getTranslationResource('Feature.PromotedChannels');
      languageResourceProvider.setTranslationResources([featurePromotedChannelsResources]);
    }
  ]);

export default socialLinksJumbotron;
