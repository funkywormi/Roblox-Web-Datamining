import { urlService, seoName } from "core-utilities";
import gameBadgesConstants from "../constants/gameBadgesConstants";

const { translationMap } = gameBadgesConstants;
export const getRarityLabel = (percentage: number): string => {
  const defaultRarity = 100;
  const referenceRarityMap = {
    1: translationMap.LabelRarityImpossible,
    5: translationMap.LabelRarityInsane,
    10: translationMap.LabelRarityExtreme,
    20: translationMap.LabelRarityHard,
    30: translationMap.LabelRarityChallenging,
    50: translationMap.LabelRarityModerate,
    70: translationMap.LabelRarityEasy,
    80: translationMap.LabelRarityCakeWalk,
    100: translationMap.LabelRarityFreebie,
  } as const;

  const closestReferenceRarity = Object.keys(referenceRarityMap)
    .sort((a, b) => {
      return Number(a) - Number(b);
    })
    .find(referenceRarity => percentage <= Number(referenceRarity)) as unknown as
    | keyof typeof referenceRarityMap
    | undefined;
  return referenceRarityMap[closestReferenceRarity || defaultRarity];
};

export const getBadgeLink = (id: number, name: string): string => {
  return urlService.getAbsoluteUrl(`/badges/${id}/${seoName.formatSeoName(name)}`);
};

export default {
  getRarityLabel,
  getBadgeLink,
};
