import angular from "angular";
import { TranslationResourceProvider } from "Roblox";

let favorites = angular.module("favorites", ["assetsExplorer", "favoritesAppTemplates", "cursorPagination"])
    .config(["languageResourceProvider", function (languageResourceProvider) {
        const translationProvider = new TranslationResourceProvider();
        const featureFavoritesResources = translationProvider.getTranslationResource('Feature.Favorites');
        languageResourceProvider.setTranslationResources([featureFavoritesResources]);
    }]);

export default favorites;