import React, { useCallback, useRef } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import { TExploreApiGameSort } from "../../common/types/bedev2Types";
import { EventStreamMetadata, SessionInfoType } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";
import {
  getSortAppliedFiltersMetadata,
  getSortTargetIdMetadata,
} from "../../omniFeed/utils/gameSortUtils";
import GameGrid from "../../common/components/GameGrid";
import useGameImpressionsIntersectionTracker, {
  TBuildGridGameImpressionsEventProperties,
} from "../../common/hooks/useGameImpressionsIntersectionTracker";
import { TBuildEventProperties } from "../../common/components/GameTileUtils";
import { CommonGameSorts } from "../../common/constants/translationConstants";
import {
  getSponsoredAdImpressionsData,
  getTileBadgeContextsImpressionsData,
} from "../../common/utils/parsingUtils";
import { TGameData } from "../../common/types/bedev1Types";
import useVerticalScrollTracker from "../../common/components/useVerticalScrollTracker";
import { usePageSession } from "../../common/utils/PageSessionContext";
import GamesInfoTooltip from "../../common/components/GamesInfoTooltip";
import { gamesPage } from "../../common/constants/configConstants";

const GamesSeeAllGrid = ({
  sort,
  isFetching,
  loadMoreData,
  translate,
}: {
  sort: TExploreApiGameSort;
  isFetching: boolean;
  loadMoreData: () => void;
  translate: TranslateFunction;
}): JSX.Element => {
  const gridRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);

  const discoverPageSessionInfo = usePageSession();

  // header can be pre-rendered on server-side. if so, we don't need to show it again.
  const shouldShowHeader = document.getElementsByClassName("header-section").length === 0;

  useVerticalScrollTracker(PageContext.SortDetailPageDiscover);

  const buildEventProperties: TBuildEventProperties = (data: TGameData, id: number) => ({
    [EventStreamMetadata.PlaceId]: data.placeIdOverride ?? data.placeId,
    [EventStreamMetadata.PlaceIdOverride]: data.placeIdOverride,
    [EventStreamMetadata.UniverseId]: data.universeId,
    [EventStreamMetadata.IsAd]: data.isSponsored,
    [EventStreamMetadata.NativeAdData]: data.nativeAdData,
    [EventStreamMetadata.Position]: id,
    [EventStreamMetadata.NumberOfLoadedTiles]: sort.games.length,
    [EventStreamMetadata.GameSetTypeId]: sort.topicId,
    ...getSortTargetIdMetadata(sort),
    ...getSortAppliedFiltersMetadata(sort),
    [EventStreamMetadata.Page]: PageContext.SortDetailPageDiscover,
    [SessionInfoType.DiscoverPageSessionInfo]: discoverPageSessionInfo,
    [EventStreamMetadata.LaunchData]: data.launchDataOverride,
  });

  const buildGameImpressionsProperties: TBuildGridGameImpressionsEventProperties = useCallback(
    (viewedIndex: number[]) => {
      const parsedViewedIndex = viewedIndex.filter(id => id < sort.games.length);
      return {
        [EventStreamMetadata.RootPlaceIds]: parsedViewedIndex.map(id => sort.games[id]!.placeId),
        [EventStreamMetadata.UniverseIds]: parsedViewedIndex.map(id => sort.games[id]!.universeId),
        [EventStreamMetadata.AbsPositions]: parsedViewedIndex,
        ...getSponsoredAdImpressionsData(sort.games, parsedViewedIndex),
        [EventStreamMetadata.EmphasisFlag]: false,
        [EventStreamMetadata.GameSetTypeId]: sort.topicId,
        ...getSortTargetIdMetadata(sort),
        ...getSortAppliedFiltersMetadata(sort),
        ...getTileBadgeContextsImpressionsData(sort.games, sort.topicId, parsedViewedIndex),
        [EventStreamMetadata.Page]: PageContext.SortDetailPageDiscover,
        [SessionInfoType.DiscoverPageSessionInfo]: discoverPageSessionInfo,
      };
    },
    [sort, discoverPageSessionInfo],
  );

  useGameImpressionsIntersectionTracker(gridRef, sort.games.length, buildGameImpressionsProperties);

  return (
    <div className="game-sort-detail-container">
      {shouldShowHeader && (
        <h1>
          {sort.topic}
          {sort.topicId === gamesPage.adSortDiscoverId && (
            <GamesInfoTooltip
              tooltipText={
                translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
                "Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics."
              }
              placement="right"
              sizeInPx={22}
            />
          )}
        </h1>
      )}
      <GameGrid
        ref={gridRef}
        emphasis={false}
        tileRef={tileRef}
        gameData={sort.games}
        translate={translate}
        buildEventProperties={buildEventProperties}
        shouldUseSentinelTile
        loadData={loadMoreData}
      />
      {isFetching && <Loading />}
    </div>
  );
};

export default GamesSeeAllGrid;
