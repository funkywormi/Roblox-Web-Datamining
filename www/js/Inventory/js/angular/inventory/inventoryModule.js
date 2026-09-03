import angular from "angular";
import { TranslationResourceProvider } from "Roblox";

let inventory = angular.module("inventory", ["assetsExplorer", "inventoryAppTemplates", "recommendations", "cursorPagination"])
    .config(["languageResourceProvider", function (languageResourceProvider) {
        const translationProvider = new TranslationResourceProvider();
        const featureRecommendationsResources = translationProvider.getTranslationResource('Feature.Recommendations');
        languageResourceProvider.setTranslationResources([featureRecommendationsResources]);
    }]);

export default inventory;