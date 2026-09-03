import React, { useMemo, useState, useCallback, useRef, useLayoutEffect } from "react";
import { throttle } from "lodash";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import { GameGrid } from "../../common/components/GameGrid";
import { getNumTilesPerRow, TBuildEventProperties } from "../../common/components/GameTileUtils";
import bedev2Services from "../../common/services/bedev2Services";
import { TGameData } from "../../common/types/bedev1Types";
import {
  TContentType,
  TOmniRecommendationGameSort,
  TOmniRecommendationsContentMetadata,
} from "../../common/types/bedev2Types";
import { EventStreamMetadata, SessionInfoType } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";
import { common } from "../../common/constants/configConstants";
import useGameImpressionsIntersectionTracker, {
  TBuildGridGameImpressionsEventProperties,
} from "../../common/hooks/useGameImpressionsIntersectionTracker";
import {
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData,
} from "../../common/utils/parsingUtils";
import { hydrateOmniRecommendationGames } from "../../omniFeed/utils/gameSortUtils";

type TSortDetailGridV2DiscoveryApiProps = {
  sort: TOmniRecommendationGameSort;
  homePageSessionInfo: string;
  contentMetadata: TOmniRecommendationsContentMetadata | null;
  appendContentMetadata: (additionalMetadata: TOmniRecommendationsContentMetadata) => void;
  translate: WithTranslationsProps["translate"];
};

const { numberOfGameTilesPerLoad } = common;

export const SortDetailGridV2DiscoveryApi = ({
  sort,
  translate,
  contentMetadata,
  appendContentMetadata,
  homePageSessionInfo,
}: TSortDetailGridV2DiscoveryApiProps): JSX.Element => {
  const gridRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [itemsPerRow, setItemsPerRow] = useState<number | undefined>(undefined);

  const gamesWithoutMetadata = useMemo(
    () =>
      (sort.recommendationList ?? []).filter(
        ({ contentType, contentId }: { contentType: TContentType.Game; contentId: number }) =>
          !contentMetadata?.[contentType]?.[contentId],
      ),
    [sort.recommendationList, contentMetadata],
  );

  const fetchAdditionalMetadata = useCallback(() => {
    setLoading(true);
    bedev2Services
      .getOmniRecommendationsMetadata(
        gamesWithoutMetadata.slice(0, numberOfGameTilesPerLoad),
        homePageSessionInfo,
      )
      .then(additionalMetadata => {
        appendContentMetadata(additionalMetadata.contentMetadata);
      })
      .catch(() => {
        // empty catch block, as this is not blocking. we will show the games we already have metadata for
      })
      .finally(() => {
        setLoading(false);
      });
  }, [homePageSessionInfo, gamesWithoutMetadata, appendContentMetadata]);

  const loadMoreGames = useCallback(() => {
    if (gamesWithoutMetadata.length > 0) {
      fetchAdditionalMetadata();
    }
  }, [gamesWithoutMetadata.length, fetchAdditionalMetadata]);

  const gameData: TGameData[] = useMemo(() => {
    return hydrateOmniRecommendationGames(sort.recommendationList, contentMetadata);
  }, [sort.recommendationList, contentMetadata]);

  const buildEventProperties: TBuildEventProperties = useCallback(
    (data, id) => {
      return {
        placeId: data.placeIdOverride ?? data.placeId,
        placeIdOverride: data.placeIdOverride,
        universeId: data.universeId,
        isAd: gameData[id]?.isSponsored,
        nativeAdData: gameData[id]?.nativeAdData,
        position: id,
        numberOfLoadedTiles: (gameData || []).length,
        gameSetTypeId: sort.topicId,
        homePageSessionInfo,
        page: PageContext.SortDetailPageHome,
        launchData: data.launchDataOverride,
      };
    },
    [gameData, homePageSessionInfo, sort.topicId],
  );

  const buildGameImpressionsProperties: TBuildGridGameImpressionsEventProperties = useCallback(
    (viewedIndex: number[]) => {
      if (gameData !== undefined) {
        const parsedViewedIndex = viewedIndex.filter(id => id < gameData?.length);
        return {
          [EventStreamMetadata.RootPlaceIds]: parsedViewedIndex.map(id => gameData[id]!.placeId),
          [EventStreamMetadata.UniverseIds]: parsedViewedIndex.map(id => gameData[id]!.universeId),
          [EventStreamMetadata.AbsPositions]: parsedViewedIndex,
          ...getSponsoredAdImpressionsData(gameData, parsedViewedIndex),
          ...getThumbnailAssetIdImpressionsData(
            gameData,
            sort.topicId,
            parsedViewedIndex,
            sort.topicLayoutData?.componentType,
          ),
          ...getTileBadgeContextsImpressionsData(gameData, sort.topicId, parsedViewedIndex),
          [EventStreamMetadata.NavigationUids]: parsedViewedIndex.map(
            id => gameData[id]!.navigationUid ?? "0",
          ),
          [EventStreamMetadata.GameSetTypeId]: sort.topicId,
          [EventStreamMetadata.EmphasisFlag]: false,
          [EventStreamMetadata.Page]: PageContext.SortDetailPageHome,
          [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo,
        };
      }

      return undefined;
    },
    [gameData, homePageSessionInfo, sort.topicId, sort.topicLayoutData?.componentType],
  );

  useGameImpressionsIntersectionTracker(
    gridRef,
    gameData?.length ?? 0,
    buildGameImpressionsProperties,
  );

  const seeAllFeedRef = useCallback(
    (node: HTMLDivElement) => {
      const updateItemsPerRowThrottled = throttle((feedWidth: number) => {
        setItemsPerRow(getNumTilesPerRow(feedWidth, 0, sort?.topicLayoutData?.componentType));
      }, 100);

      const handleResize = () => {
        const seeAllFeedWidth = node?.getBoundingClientRect()?.width;
        if (seeAllFeedWidth) {
          document.documentElement.style.setProperty("--home-feed-width", `${seeAllFeedWidth}px`);

          // Throttle computation of items per row, since 'resize' fires frequently
          updateItemsPerRowThrottled(seeAllFeedWidth);
        }
      };

      handleResize();

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    },
    [sort?.topicLayoutData?.componentType],
  );

  useLayoutEffect(() => {
    if (itemsPerRow && gridRef?.current) {
      gridRef.current.style.setProperty("--items-per-row", itemsPerRow.toString());
    }
  }, [itemsPerRow]);

  return (
    <div className="game-sort-detail-grid-container home-page" ref={seeAllFeedRef}>
      <GameGrid
        ref={gridRef}
        emphasis={false}
        tileRef={tileRef}
        gameData={gameData || []}
        translate={translate}
        buildEventProperties={buildEventProperties}
        componentType={sort.topicLayoutData?.componentType}
        playButtonStyle={sort.topicLayoutData?.playButtonStyle}
        playerCountStyle={sort.topicLayoutData?.playerCountStyle}
        hoverStyle={sort.topicLayoutData?.hoverStyle}
        topicId={sort.topicId?.toString()}
        isDynamicLayoutSizingEnabled
        isHomeGameGrid
        shouldUseSentinelTile
        loadData={loadMoreGames}
      />
      {loading && <Loading />}
    </div>
  );
};

export default SortDetailGridV2DiscoveryApi;
