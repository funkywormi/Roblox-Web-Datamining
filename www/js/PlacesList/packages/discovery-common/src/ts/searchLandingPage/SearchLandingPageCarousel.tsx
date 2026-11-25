import React, { forwardRef, useCallback, useContext, useRef } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { TBuildEventProperties } from "../common/components/GameTileUtils";
import { EventStreamMetadata, SessionInfoType } from "../common/constants/eventStreamConstants";
import { PageContext } from "../common/types/pageContext";
import useGameImpressionsIntersectionTracker, {
  TBuildCarouselGameImpressionsEventProperties,
} from "../common/hooks/useGameImpressionsIntersectionTracker";
import GameCarouselContainerHeaderBase from "../common/components/GameCarouselContainerHeaderBase";
import GameCarouselHorizontalScrollBase from "../gamesPage/components/GameCarouselHorizontalScrollBase";
import GameTileContent from "../common/components/GameTileContent";
import type { TGameTileTypeMapProps } from "../common/components/GameTileTypeMap";
import {
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData,
} from "../common/utils/parsingUtils";
import SearchLandingPageSessionContext from "./SearchLandingPageSessionContext";
import { getSortTargetIdMetadata } from "../omniFeed/utils/gameSortUtils";
import { TExploreApiGameSort } from "../common/types/bedev2Types";
import { TGameData, TGetFriendsResponse } from "../common/types/bedev1Types";
import { PersonalizedRecommendationsMenu } from "../personalizedRecommendations/PersonalizedRecommendationsMenu";

const SearchLandingTile = forwardRef<HTMLDivElement, TGameTileTypeMapProps>(
  ({ componentType: _componentType, ...tileProps }, ref) => (
    <GameTileContent ref={ref} {...tileProps} />
  ),
);
SearchLandingTile.displayName = "SearchLandingTile";

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

  // The server owns visibility: it sends the surface key only to viewers who may see the menu.
  const personalizedRecommendationsSurfaceKey =
    sort.topicLayoutData?.personalizedRecommendationsSurfaceKey;

  return (
    // TODO CLIGROW-2261 Support component type / wide (16:9) aspect ratio tiles
    <React.Fragment>
      <GameCarouselContainerHeaderBase
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
        trailingComponent={
          personalizedRecommendationsSurfaceKey ? (
            // The search landing page hides when the search input blurs.
            <PersonalizedRecommendationsMenu
              surfaceKey={personalizedRecommendationsSurfaceKey}
              keepFocusOnOpen
            />
          ) : undefined
        }
      />
      <GameCarouselHorizontalScrollBase
        TileComponent={SearchLandingTile}
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
