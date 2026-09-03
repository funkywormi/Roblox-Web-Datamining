import angular from 'angular';
import { TranslationResourceProvider } from 'Roblox';

let fileUpload = angular.module("fileUpload", ["fileUploadHtmlTemplate", "systemFeedback", "thumbnails"])
    .config(["languageResourceProvider", function (languageResourceProvider) {
        const translationProvider = new TranslationResourceProvider();
        const fileUploadComponentResources = translationProvider.getTranslationResource('Feature.FileUploadComponent');
        languageResourceProvider.setTranslationResources([fileUploadComponentResources]);
}]);

export default fileUpload;