import React, { useMemo } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import HomePageCarouselDiscoveryApi from "../homePage/discoveryApi/HomePageCarouselDiscoveryApi";
import { TGameData, TGetFriendsResponse } from "../common/types/bedev1Types";
import { TComponentType, TGameSort, TRequestIntent } from "../common/types/bedev2Types";
import { TOmniRecommendationAnalyticsData } from "../common/types/analyticsTypes";
import { useContentMetadata } from "./utils/contentMetadataContextProvider";
import { getNumCarouselTiles } from "../common/components/GameTileUtils";
import {
  buildOmniRecommendationAnalyticsData,
  getHydratedGameData,
  isExploreApiGameSort,
  isOmniRecommendationGameSort,
} from "./utils/gameSortUtils";
import GamesPageGameCarousel from "../gamesPage/components/GamesPageGameCarousel";
import { PageContext } from "../common/types/pageContext";
import SearchLandingPageGamesCarousel from "../searchLandingPage/SearchLandingPageCarousel";
import { searchLandingPage } from "../common/constants/configConstants";

type THomePageDiscoveryApiProps = {
  translate: WithTranslationsProps["translate"];
  sort: TGameSort;
  positionId: number;
  page: PageContext.HomePage | PageContext.GamesPage | PageContext.SearchLandingPage;
  itemsPerRow: number | undefined;
  startingRow: number | undefined;
  topicPositionOffset?: number;
  friendsPresenceData: TGetFriendsResponse[];
  loadMoreGames?: () => void;
  isLoadingMoreGames?: boolean;
  isDynamicLayoutSizingEnabled?: boolean;
  isCarouselHorizontalScrollEnabled?: boolean;
  isNewScrollArrowsEnabled?: boolean;
  isNewSortHeaderEnabled?: boolean;
  refreshFeed?: (requestIntent?: TRequestIntent) => void;
};

export const GameCarouselFeedItem = ({
  translate,
  sort,
  positionId,
  page,
  itemsPerRow,
  startingRow,
  topicPositionOffset,
  friendsPresenceData,
  loadMoreGames,
  isLoadingMoreGames,
  isDynamicLayoutSizingEnabled,
  isCarouselHorizontalScrollEnabled,
  isNewScrollArrowsEnabled,
  isNewSortHeaderEnabled,
  refreshFeed,
}: THomePageDiscoveryApiProps): JSX.Element | null => {
  const { contentMetadata } = useContentMetadata();

  // Enable carousel horizontal scroll and arrows on Home Event Tile carousels for all users
  const isCarouselScrollEnabled =
    isCarouselHorizontalScrollEnabled ||
    (page === PageContext.HomePage &&
      sort?.topicLayoutData?.componentType === TComponentType.EventTile);

  const isNewArrowsEnabled =
    isNewScrollArrowsEnabled ||
    (page === PageContext.HomePage &&
      sort?.topicLayoutData?.componentType === TComponentType.EventTile);

  const carouselData: TGameData[] = useMemo(() => {
    if (isCarouselScrollEnabled) {
      // Return all games, since scrolling is enabled
      return getHydratedGameData(sort, contentMetadata);
    }

    if (isDynamicLayoutSizingEnabled) {
      return getHydratedGameData(sort, contentMetadata).slice(0, itemsPerRow);
    }

    return getHydratedGameData(sort, contentMetadata).slice(
      0,
      getNumCarouselTiles(page, sort.topicLayoutData?.componentType),
    );
  }, [
    sort,
    contentMetadata,
    page,
    itemsPerRow,
    isDynamicLayoutSizingEnabled,
    isCarouselScrollEnabled,
  ]);

  const omniAnalyticsData = useMemo<TOmniRecommendationAnalyticsData>(() => {
    if (!isOmniRecommendationGameSort(sort)) {
      return { sortLevel: {}, itemLevel: {} };
    }
    return buildOmniRecommendationAnalyticsData(sort.recommendationList ?? [], sort.analyticsData);
  }, [sort]);

  if (carouselData?.length === 0) {
    return null;
  }

  if (page === PageContext.GamesPage) {
    return (
      <GamesPageGameCarousel
        key={sort.topic}
        sort={sort}
        translate={translate}
        positionId={positionId}
        page={page}
        gameData={carouselData}
        loadMoreGames={loadMoreGames as () => void}
        isLoadingMoreGames={isLoadingMoreGames === true}
        tooltipInfoText={sort.topicLayoutData?.infoText}
        hideSeeAll={sort.topicLayoutData?.hideSeeAll === "true"}
        componentType={sort.topicLayoutData?.componentType}
        playerCountStyle={sort.topicLayoutData?.playerCountStyle}
        playButtonStyle={sort.topicLayoutData?.playButtonStyle}
        subtitleLinkPath={sort.topicLayoutData?.subtitleLinkPath}
        itemsPerRow={itemsPerRow}
        isNewScrollArrowsEnabled={isNewArrowsEnabled}
        isNewSortHeaderEnabled={isNewSortHeaderEnabled}
      />
    );
  }

  if (page === PageContext.SearchLandingPage && isExploreApiGameSort(sort)) {
    return (
      <SearchLandingPageGamesCarousel
        key={sort.topic}
        sort={sort}
        gameData={carouselData}
        translate={translate}
        positionId={positionId}
        itemsPerRow={searchLandingPage.numberOfTilesPerCarousel}
        friendsPresenceData={friendsPresenceData}
      />
    );
  }

  return (
    <HomePageCarouselDiscoveryApi
      key={sort.topic}
      sort={sort}
      translate={translate}
      positionId={positionId}
      gameData={carouselData}
      friendsPresence={friendsPresenceData}
      itemsPerRow={itemsPerRow}
      startingRow={startingRow}
      topicPositionOffset={topicPositionOffset}
      componentType={sort.topicLayoutData?.componentType}
      playerCountStyle={sort.topicLayoutData?.playerCountStyle}
      playButtonStyle={sort.topicLayoutData?.playButtonStyle}
      hoverStyle={sort.topicLayoutData?.hoverStyle}
      tooltipInfoText={sort.topicLayoutData?.infoText}
      hideSeeAll={sort.topicLayoutData?.hideSeeAll === "true"}
      navigationRootPlaceId={sort.topicLayoutData?.navigationRootPlaceId}
      isSponsoredFooterAllowed={sort.topicLayoutData?.isSponsoredFooterAllowed === "true"}
      seeAllLinkPath={sort.topicLayoutData?.linkPath}
      subtitleLinkPath={sort.topicLayoutData?.subtitleLinkPath}
      endTimestamp={sort.topicLayoutData?.endTimestamp}
      countdownString={sort.topicLayoutData?.countdownString}
      hideTileMetadata={sort.topicLayoutData?.hideTileMetadata === "true"}
      isDynamicLayoutSizingEnabled={isDynamicLayoutSizingEnabled}
      isCarouselHorizontalScrollEnabled={isCarouselScrollEnabled}
      isNewScrollArrowsEnabled={isNewArrowsEnabled}
      isNewSortHeaderEnabled={isNewSortHeaderEnabled}
      omniAnalyticsData={omniAnalyticsData}
      refreshFeed={refreshFeed}
    />
  );
};

GameCarouselFeedItem.defaultProps = {
  loadMoreGames: undefined,
  isLoadingMoreGames: undefined,
  isDynamicLayoutSizingEnabled: undefined,
  isCarouselHorizontalScrollEnabled: undefined,
  isNewScrollArrowsEnabled: undefined,
  isNewSortHeaderEnabled: undefined,
};

export default GameCarouselFeedItem;
