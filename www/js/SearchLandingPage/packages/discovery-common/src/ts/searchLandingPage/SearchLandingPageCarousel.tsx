import React, { useCallback, useContext, useRef } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { TBuildEventProperties } from "../common/components/GameTileUtils";
import { EventStreamMetadata, SessionInfoType } from "../common/constants/eventStreamConstants";
import { PageContext } from "../common/types/pageContext";
import useGameImpressionsIntersectionTracker, {
  TBuildCarouselGameImpressionsEventProperties,
} from "../common/hooks/useGameImpressionsIntersectionTracker";
import GameCarouselContainerHeader from "../common/components/GameCarouselContainerHeader";
import GameCarouselHorizontalScroll from "../gamesPage/components/GameCarouselHorizontalScroll";
import {
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData,
} from "../common/utils/parsingUtils";
import SearchLandingPageSessionContext from "./SearchLandingPageSessionContext";
import { getSortTargetIdMetadata } from "../omniFeed/utils/gameSortUtils";
import { TExploreApiGameSort } from "../common/types/bedev2Types";
import { TGameData, TGetFriendsResponse } from "../common/types/bedev1Types";

type SearchLandingPageGamesCarouselProps = {
  positionId: number;
  sort: TExploreApiGameSort;
  translate: WithTranslationsProps["translate"];
  itemsPerRow?: number;
  gameData: TGameData[];
  friendsPresenceData: TGetFriendsResponse[];
};

const SearchLandingPageGamesCarousel = ({
  translate,
  sort,
  positionId,
  itemsPerRow,
  gameData,
  friendsPresenceData,
}: SearchLandingPageGamesCarouselProps): JSX.Element => {
  const sessionInfo = useContext(SearchLandingPageSessionContext);
  // Type union will be cleaned up with isCarouselHorizontalScrollEnabled
  const carouselRef = useRef<HTMLDivElement | HTMLUListElement>(null);

  const buildEventProperties: TBuildEventProperties = useCallback(
    (data, id) => ({
      [EventStreamMetadata.PlaceId]: data.placeId,
      [EventStreamMetadata.UniverseId]: data.universeId,
      [EventStreamMetadata.IsAd]: data.isSponsored,
      [EventStreamMetadata.NativeAdData]: data.nativeAdData,
      [EventStreamMetadata.Position]: id,
      [EventStreamMetadata.SortPos]: positionId,
      [EventStreamMetadata.NumberOfLoadedTiles]: gameData.length,
      ...getSortTargetIdMetadata(sort),
      [EventStreamMetadata.SortId]: sort.sortId,
      [EventStreamMetadata.Page]: PageContext.SearchLandingPage,
      [SessionInfoType.SearchLandingPageSessionInfo]: sessionInfo,
      [EventStreamMetadata.PlayContext]: PageContext.SearchLandingPage,
    }),
    [positionId, gameData.length, sort, sessionInfo],
  );

  const buildGameImpressionsProperties: TBuildCarouselGameImpressionsEventProperties = useCallback(
    (viewedIndexes: number[]) => {
      const filteredViewedIndexes = viewedIndexes.filter(id => id < gameData.length);
      return {
        [EventStreamMetadata.RootPlaceIds]: filteredViewedIndexes.map(id => gameData[id]?.placeId!),
        [EventStreamMetadata.UniverseIds]: filteredViewedIndexes.map(
          id => gameData[id]?.universeId!,
        ),
        ...getThumbnailAssetIdImpressionsData(gameData, undefined, filteredViewedIndexes),
        ...getTileBadgeContextsImpressionsData(gameData, undefined, filteredViewedIndexes),
        ...getSponsoredAdImpressionsData(gameData, filteredViewedIndexes),
        ...getSortTargetIdMetadata(sort),
        [EventStreamMetadata.SortId]: sort.sortId,
        [EventStreamMetadata.AbsPositions]: filteredViewedIndexes,
        [EventStreamMetadata.SortPos]: positionId,
        [EventStreamMetadata.NumberOfLoadedTiles]: gameData.length,
        [EventStreamMetadata.Page]: PageContext.SearchLandingPage,
        [SessionInfoType.SearchLandingPageSessionInfo]: sessionInfo,
      };
    },
    [gameData, sort, positionId, sessionInfo],
  );

  useGameImpressionsIntersectionTracker(
    carouselRef,
    gameData.length,
    buildGameImpressionsProperties,
  );

  return (
    // TODO CLIGROW-2261 Support component type / wide (16:9) aspect ratio tiles
    <React.Fragment>
      <GameCarouselContainerHeader
        sortTitle={sort.topic}
        sortSubtitle={sort.subtitle}
        shouldShowSeparateSubtitleLink={false}
        isSortLinkOverrideEnabled={false}
        titleContainerClassName="container-header"
        hideSeeAll
        translate={translate}
        seeAllLink={undefined}
        subtitleLink={undefined}
        shouldShowSponsoredTooltip={undefined}
      />
      <GameCarouselHorizontalScroll
        gameData={gameData}
        sort={sort}
        positionId={positionId}
        hideScrollBackWhenDisabled
        sortIdStr={sort.sortId}
        page={PageContext.SearchLandingPage}
        gamesContainerRef={carouselRef}
        buildEventProperties={buildEventProperties}
        isLoadingMoreGames={false}
        itemsPerRow={itemsPerRow}
        friendData={friendsPresenceData}
        topicId={sort.topicId?.toString()}
        isDynamicLayoutSizingEnabled={false}
        isCarouselHorizontalScrollEnabled
        isNewScrollArrowsEnabled={false}
        translate={translate}
      />
    </React.Fragment>
  );
};

SearchLandingPageGamesCarousel.defaultProps = {
  itemsPerRow: undefined,
};

export default SearchLandingPageGamesCarousel;
