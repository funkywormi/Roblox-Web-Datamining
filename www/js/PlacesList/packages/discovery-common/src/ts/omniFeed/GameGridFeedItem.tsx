import React, { useEffect, useCallback, useMemo } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { TGameData, TGetFriendsResponse } from "../common/types/bedev1Types";
import { TContentType, TGameSort, TOmniRecommendationGame } from "../common/types/bedev2Types";
import { TOmniRecommendationAnalyticsData } from "../common/types/analyticsTypes";
import HomePageGridDiscoveryApi from "../homePage/discoveryApi/HomePageGridDiscoveryApi";
import bedev2Services from "../common/services/bedev2Services";
import { homePage } from "../common/constants/configConstants";
import { useContentMetadata } from "./utils/contentMetadataContextProvider";
import {
  buildOmniRecommendationAnalyticsData,
  hydrateOmniRecommendationGames,
  isOmniRecommendationGameSort,
} from "./utils/gameSortUtils";
import { usePageSession } from "../common/utils/PageSessionContext";

type THomePageDiscoveryApiProps = {
  translate: WithTranslationsProps["translate"];
  sort: TGameSort;
  positionId: number;
  itemsPerRow: number | undefined;
  startingRow: number | undefined;
  topicPositionOffset?: number;
  recommendations: TOmniRecommendationGame[];
  friendsPresenceData: TGetFriendsResponse[];
  isDynamicLayoutSizingEnabled?: boolean;
  isNewSortHeaderEnabled?: boolean;
  hiddenUniverses?: Set<number>;
  setHiddenUniverses?: React.Dispatch<React.SetStateAction<Set<number>>>;
};

const { sortlessGridMaxTilesMetadataToFetch } = homePage;

export const GameGridFeedItem = ({
  translate,
  sort,
  positionId,
  itemsPerRow,
  startingRow,
  topicPositionOffset,
  recommendations,
  friendsPresenceData,
  isDynamicLayoutSizingEnabled,
  isNewSortHeaderEnabled,
  hiddenUniverses,
  setHiddenUniverses,
}: THomePageDiscoveryApiProps): JSX.Element | null => {
  const homePageSessionInfo = usePageSession();

  const { contentMetadata, appendContentMetadata } = useContentMetadata();

  const fetchAdditionalMetadata = useCallback(() => {
    const gamesWithoutMetadata = recommendations.filter(
      ({ contentType, contentId }: { contentType: TContentType.Game; contentId: number }) =>
        !contentMetadata?.[contentType]?.[contentId],
    );

    if (gamesWithoutMetadata.length > 0) {
      bedev2Services
        .getOmniRecommendationsMetadata(
          gamesWithoutMetadata.slice(0, sortlessGridMaxTilesMetadataToFetch),
          homePageSessionInfo,
        )
        .then(additionalMetadata => appendContentMetadata(additionalMetadata.contentMetadata))
        .catch(() => {
          // empty catch block, as this is not blocking. we will show the games we already have metadata for
        });
    }
  }, [recommendations, homePageSessionInfo, contentMetadata, appendContentMetadata]);

  useEffect(() => {
    fetchAdditionalMetadata();
  }, [fetchAdditionalMetadata]);

  const gridData: TGameData[] = useMemo(() => {
    return hydrateOmniRecommendationGames(recommendations, contentMetadata);
  }, [recommendations, contentMetadata]);

  const omniAnalyticsData = useMemo<TOmniRecommendationAnalyticsData>(() => {
    if (!isOmniRecommendationGameSort(sort)) {
      return { sortLevel: {}, itemLevel: {} };
    }
    return buildOmniRecommendationAnalyticsData(recommendations, sort.analyticsData);
  }, [sort, recommendations]);

  if (gridData?.length === 0) {
    return null;
  }

  return (
    <HomePageGridDiscoveryApi
      key={sort.topic}
      sort={sort}
      gameData={gridData}
      omniAnalyticsData={omniAnalyticsData}
      translate={translate}
      positionId={positionId}
      itemsPerRow={itemsPerRow}
      startingRow={startingRow}
      topicPositionOffset={topicPositionOffset}
      friendsPresence={friendsPresenceData}
      componentType={sort.topicLayoutData?.componentType}
      playerCountStyle={sort.topicLayoutData?.playerCountStyle}
      playButtonStyle={sort.topicLayoutData?.playButtonStyle}
      hoverStyle={sort.topicLayoutData?.hoverStyle}
      isSponsoredFooterAllowed={sort.topicLayoutData?.isSponsoredFooterAllowed === "true"}
      isSponsoredRatingFooterAllowed={
        sort.topicLayoutData?.isSponsoredRatingFooterAllowed === "true"
      }
      hideTileMetadata={sort.topicLayoutData?.hideTileMetadata === "true"}
      isDynamicLayoutSizingEnabled={isDynamicLayoutSizingEnabled}
      isNewSortHeaderEnabled={isNewSortHeaderEnabled}
      enableExplicitFeedback={sort.topicLayoutData?.enableExplicitFeedback === "true"}
      hiddenUniverses={hiddenUniverses}
      setHiddenUniverses={setHiddenUniverses}
      enableSponsoredFeedback={sort.topicLayoutData?.enableSponsoredFeedback === "true"}
      sponsoredUserCohort={sort.topicLayoutData?.sponsoredUserCohort}
      enableReportAd={sort.topicLayoutData?.enableReportAd === "true"}
      sponsoredFooterAdLabelText={sort.topicLayoutData?.sponsoredFooterAdLabelText}
      sponsoredFooterAdLabelFirst={sort.topicLayoutData?.sponsoredFooterAdLabelFirst !== "false"}
      sponsoredFooterIncludeRatingContent={
        sort.topicLayoutData?.sponsoredFooterIncludeRatingContent === "true"
      }
    />
  );
};

GameGridFeedItem.defaultProps = {
  isDynamicLayoutSizingEnabled: undefined,
  isNewSortHeaderEnabled: undefined,
};

export default GameGridFeedItem;
