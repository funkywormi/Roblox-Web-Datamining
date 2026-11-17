import { authenticatedUser } from "@rbx/core-scripts/meta/user";

export enum GameTileOverflowMenuItems {
  NotInterested = "NotInterested",
  ReportExperience = "ReportExperience",
  WhyThisAd = "WhyThisAd",
  ReportAd = "ReportAd",
  RemoveFromFavorites = "RemoveFromFavorites",
}

export default {
  GameTileOverflowMenuItems,
};

export type TGameTileOverflowMenuEligibility = {
  enableExplicitFeedback?: boolean;
  setIsHidden?: (isHidden: boolean) => void;
  enableSponsoredFeedback?: boolean;
  isSponsored?: boolean;
  enableReportExperience?: boolean;
  reportExperienceAttributes?: Record<string, string>;
  enableReportAd?: boolean;
  encryptedAdTrackingData?: string;
  enableRemoveFromFavorites?: boolean;
  onRemoveFromFavorites?: () => void;
};

export const getGameTileOverflowMenuItemsToShow = ({
  enableExplicitFeedback,
  setIsHidden,
  enableSponsoredFeedback,
  isSponsored,
  enableReportExperience,
  reportExperienceAttributes,
  enableReportAd,
  encryptedAdTrackingData,
  enableRemoveFromFavorites,
  onRemoveFromFavorites,
}: TGameTileOverflowMenuEligibility): GameTileOverflowMenuItems[] => {
  const items: GameTileOverflowMenuItems[] = [];
  if (enableExplicitFeedback && (!isSponsored || enableSponsoredFeedback) && setIsHidden) {
    items.push(GameTileOverflowMenuItems.NotInterested);
  }
  if (
    enableReportExperience &&
    reportExperienceAttributes &&
    !isSponsored &&
    authenticatedUser()?.isAuthenticated
  ) {
    items.push(GameTileOverflowMenuItems.ReportExperience);
  }
  if (enableSponsoredFeedback && isSponsored) {
    items.push(GameTileOverflowMenuItems.WhyThisAd);
  }
  if (enableReportAd && isSponsored && encryptedAdTrackingData) {
    items.push(GameTileOverflowMenuItems.ReportAd);
  }
  if (enableRemoveFromFavorites && onRemoveFromFavorites) {
    items.push(GameTileOverflowMenuItems.RemoveFromFavorites);
  }
  return items;
};
