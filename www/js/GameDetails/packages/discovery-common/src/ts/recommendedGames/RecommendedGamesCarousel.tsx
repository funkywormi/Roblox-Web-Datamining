import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loading } from "@rbx/core-ui";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { TGameData } from "../common/types/bedev1Types";
import GameCarousel from "../common/components/GameCarousel";
import { TBuildEventProperties } from "../common/components/GameTileUtils";
import { EventStreamMetadata } from "../common/constants/eventStreamConstants";
import experimentConstants from "../common/constants/experimentConstants";
import { PageContext } from "../common/types/pageContext";
import metadataConstants from "../gameDetails/constants/metadataConstants";
import bedev1Services from "../common/services/bedev1Services";
import { FeatureGameDetails, CommonGameSorts } from "../common/constants/translationConstants";
import configConstants from "../common/constants/configConstants";
import useGameImpressionsIntersectionTracker, {
  TBuildCarouselGameImpressionsEventProperties,
} from "../common/hooks/useGameImpressionsIntersectionTracker";
import {
  getSponsoredAdImpressionsData,
  getTileBadgeContextsImpressionsData,
} from "../common/utils/parsingUtils";
import useExperimentValues from "../common/hooks/useExperimentValues";
import { mapGameRecommendationGames } from "./utils/recommendedGamesUtils";

const { layerNames, defaultValues } = experimentConstants;

export const RecommendedGamesCarousel = ({
  translate,
}: {
  translate: WithTranslationsProps["translate"];
}): JSX.Element => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const [gameData, setGameData] = useState<TGameData[]>([]);
  const { universeId = "" } = metadataConstants.metadataData() || {};
  const [isLoading, setIsLoading] = useState(false);
  const buildEventProperties: TBuildEventProperties = (data, id) => ({
    [EventStreamMetadata.PlaceId]: data.placeId,
    [EventStreamMetadata.UniverseId]: data.universeId,
    [EventStreamMetadata.IsAd]: data.isSponsored,
    [EventStreamMetadata.NativeAdData]: data.nativeAdData,
    [EventStreamMetadata.Position]: id,
    [EventStreamMetadata.NumberOfLoadedTiles]: (gameData || []).length,
    [EventStreamMetadata.Page]: PageContext.GameDetailPage,
  });

  const buildGameImpressionsProperties: TBuildCarouselGameImpressionsEventProperties = useCallback(
    (viewedIndexes: number[]) => {
      if (gameData !== undefined) {
        const filteredViewedIndexes = viewedIndexes.filter(id => id < gameData?.length);
        return {
          [EventStreamMetadata.RootPlaceIds]: filteredViewedIndexes.map(
            id => gameData[id]!.placeId,
          ),
          [EventStreamMetadata.UniverseIds]: filteredViewedIndexes.map(
            id => gameData[id]!.universeId,
          ),
          ...getSponsoredAdImpressionsData(gameData, filteredViewedIndexes),
          ...getTileBadgeContextsImpressionsData(gameData, undefined, filteredViewedIndexes),
          [EventStreamMetadata.AbsPositions]: filteredViewedIndexes,
          [EventStreamMetadata.SortPos]: 0,
          [EventStreamMetadata.Page]: PageContext.GameDetailPage,
        };
      }

      return undefined;
    },
    [gameData],
  );

  useGameImpressionsIntersectionTracker(
    carouselRef,
    gameData.length,
    buildGameImpressionsProperties,
  );

  useEffect(() => {
    async function fetchGameRecommendations() {
      setIsLoading(true);
      try {
        const { games } = await bedev1Services.getGameRecommendations(
          universeId,
          configConstants.gameDetailsPage.maxTilesPerCarouselPage,
        );
        setGameData(mapGameRecommendationGames(games));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
      setIsLoading(false);
    }

    fetchGameRecommendations().finally(() => null);
  }, [universeId]);

  const { ixpData, isLoading: ixpLoading } = useExperimentValues(
    layerNames.gameDetails,
    defaultValues.gameDetails,
  );
  const hasUpdatedRecommendedSortTitle = ixpData.HasUpdatedRecommendedSortTitle;

  if (isLoading || ixpLoading) {
    return <Loading />;
  }

  if (gameData.length === 0) {
    return <React.Fragment />;
  }

  return (
    <React.Fragment>
      <h3>
        {hasUpdatedRecommendedSortTitle
          ? translate(CommonGameSorts.LabelPeopleAlsoJoin)
          : translate(FeatureGameDetails.HeadingRecommendedGames)}
      </h3>
      <GameCarousel
        ref={carouselRef}
        tileRef={tileRef}
        gameData={gameData}
        buildEventProperties={buildEventProperties}
        translate={translate}
      />
    </React.Fragment>
  );
};

export default RecommendedGamesCarousel;
