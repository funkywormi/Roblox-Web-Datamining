import { EnvironmentUrls, Intl } from "Roblox";
import { urlService } from "core-utilities";

const { composeQueryString } = urlService;

const badgePageLoadSize = 100;
const badgePageSize = 20;
const minimumDisplayedBadgeCount = 3;

const urls = {
  getGameBadges: (
    universeId: string,
    cursor?: string,
    limit?: number,
  ): { url: string; withCredentials: boolean } => ({
    url: `${EnvironmentUrls.badgesApi}/v1/universes/${universeId}/badges?${composeQueryString({
      cursor,
      limit,
      // languageCode is only used to append a unique code for locale to the request URL, it is not used in the BE
      languageCode: new Intl().getRobloxLocale(),
      sortOrder: "Asc",
    })}`,
    withCredentials: true,
  }),
};

const translationMap = {
  HeadingGameBadges: "HeadingGameBadges",
  LabelRarity: "LabelRarity",
  LabelSeeMore: "LabelSeeMore",
  LabelWonYesterday: "LabelWonYesterday",
  LabelWonEver: "LabelWonEver",
  LabelRarityImpossible: "Label.RarityImpossible",
  LabelRarityInsane: "Label.RarityInsane",
  LabelRarityExtreme: "Label.RarityExtreme",
  LabelRarityHard: "Label.RarityHard",
  LabelRarityChallenging: "Label.RarityChallenging",
  LabelRarityModerate: "Label.RarityModerate",
  LabelRarityEasy: "Label.RarityEasy",
  LabelRarityCakeWalk: "Label.RarityCakeWalk",
  LabelRarityFreebie: "Label.RarityFreebie",
};
export default {
  translationMap,
  badgePageSize,
  badgePageLoadSize,
  minimumDisplayedBadgeCount,
  urls,
};
