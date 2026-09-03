import gameBadgesModule from "../gameBadgesModule.js";

function badgesLanguageService(languageResource) {
    "ngInject";

    const winRatePercentageLabelNames = {
        1: languageResource.get("Label.RarityImpossible"),
        5: languageResource.get("Label.RarityInsane"),
        10: languageResource.get("Label.RarityExtreme"),
        20: languageResource.get("Label.RarityHard"),
        30: languageResource.get("Label.RarityChallenging"),
        50: languageResource.get("Label.RarityModerate"),
        70: languageResource.get("Label.RarityEasy"),
        80: languageResource.get("Label.RarityCakeWalk"),
        100: languageResource.get("Label.RarityFreebie")
    };

    return {
        getRarityName: function (winRatePercentage) {
            var rarityLevels = Object.keys(winRatePercentageLabelNames);
            for (var n = 0; n < rarityLevels.length; n++) {
                var rarityLevel = Number(rarityLevels[n]);
                if (winRatePercentage <= rarityLevel) {
                    return winRatePercentageLabelNames[rarityLevel];
                }
            }

            return winRatePercentageLabelNames[100];
        }
    };
}

gameBadgesModule.factory("badgesLanguageService", badgesLanguageService);
export default badgesLanguageService; 