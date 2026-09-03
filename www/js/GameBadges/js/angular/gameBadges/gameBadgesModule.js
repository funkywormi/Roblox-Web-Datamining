import angular from "angular";
import { TranslationResourceProvider } from "Roblox";

let gameBadges = angular.module("gameBadges", ["robloxApp", "cursorPagination", "gameBadgesTemplates", "thumbnails"])
    .config(["languageResourceProvider", function (languageResourceProvider) {
        const translationProvider = new TranslationResourceProvider();
        const gameBadgesResources = translationProvider.getTranslationResource('Feature.GameBadges');
        languageResourceProvider.setTranslationResources([gameBadgesResources])
    }]);

export default gameBadges;