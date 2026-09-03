import { useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { usePrevious } from "@rbx/core-scripts/react";
import { isEqual } from "lodash";
import {
  TComponentType,
  TOmniRecommendationGame,
  TOmniRecommendationGameSort,
  TTreatmentType,
  TOmniRecommendationSort,
} from "../../common/types/bedev2Types";
import { homePage } from "../../common/constants/configConstants";
import { getNumTilesPerRow } from "../../common/components/GameTileUtils";
import type { TGetOmniRecommendationsResponse } from "../../common/services/bedev2Services";
import { isWideTileComponentType } from "../../common/utils/parsingUtils";

type TGridRecommendationsMap = Map<number, TOmniRecommendationGame[]>;
type TItemsPerRowMap = Map<number, number>;
type TStartingRowNumbersMap = Map<number, number>;
type TTopicPositionOffsetsMap = Map<number, number>;

const useApportionGridRecommendationsWithResize = (
  recommendations: TGetOmniRecommendationsResponse | undefined,
  isDynamicLayoutSizingEnabled: boolean | undefined,
  isCarouselHorizontalScrollEnabled: boolean | undefined,
): {
  homeFeedRef: React.RefObject<HTMLDivElement>;
  gridRecommendationsMap: TGridRecommendationsMap;
  itemsPerRowMap: TItemsPerRowMap;
  startingRowNumbersMap: TStartingRowNumbersMap;
  // For each sort position, stores the first tile's index out of all tiles with the same topicId
  // e.g. for an RFY grid chunk, topicPositionOffset is the number of tiles in the previous chunks combined
  topicPositionOffsetsMap: TTopicPositionOffsetsMap;
} => {
  const [gridRecommendationsMap, setGridRecommendationsMap] = useState<TGridRecommendationsMap>(
    new Map(),
  );

  const [itemsPerRowMap, setItemsPerRowMap] = useState<TItemsPerRowMap>(new Map());
  const [topicPositionOffsetsMap, setTopicPositionOffsetsMap] = useState<TTopicPositionOffsetsMap>(
    new Map(),
  );

  const previousItemsPerRowMap = usePrevious(itemsPerRowMap);

  const previousSorts = usePrevious(recommendations?.sorts);

  useEffect(() => {
    const apportionGridRecommendations = () => {
      const gridRecsByTopic = new Map<number, TOmniRecommendationGame[]>();
      const nextGridRecIndexByTopic = new Map<number, number>();

      recommendations?.sorts.forEach(sort => {
        if (sort.treatmentType === TTreatmentType.SortlessGrid) {
          const gridRecs = gridRecsByTopic.get(sort.topicId) ?? [];
          gridRecs.push(...(sort.recommendationList ?? []));

          gridRecsByTopic.set(sort.topicId, gridRecs);
        }
      });

      const gridRecsByPositionId: TGridRecommendationsMap = new Map();
      const topicPositionOffsetsByPositionId: TTopicPositionOffsetsMap = new Map();

      recommendations?.sorts.forEach((sort, positionId) => {
        if (sort.treatmentType === TTreatmentType.SortlessGrid) {
          const gridRecs = gridRecsByTopic.get(sort.topicId) ?? [];
          const nextGridRecIndex = nextGridRecIndexByTopic.get(sort.topicId) ?? 0;
          topicPositionOffsetsByPositionId.set(positionId, nextGridRecIndex);

          if (sort.numberOfRows !== undefined && sort.numberOfRows >= 0) {
            const itemsPerRow = itemsPerRowMap.get(positionId) ?? 0;

            const tilesNeeded = itemsPerRow * sort.numberOfRows;

            gridRecsByPositionId.set(
              positionId,
              gridRecs.slice(nextGridRecIndex, nextGridRecIndex + tilesNeeded),
            );
            nextGridRecIndexByTopic.set(sort.topicId, nextGridRecIndex + tilesNeeded);
          } else {
            // Fill the end grid with any remaining tiles
            gridRecsByPositionId.set(positionId, gridRecs.slice(nextGridRecIndex));
            nextGridRecIndexByTopic.set(sort.topicId, gridRecs.length);
          }
        }
      });
      setGridRecommendationsMap(gridRecsByPositionId);
      setTopicPositionOffsetsMap(topicPositionOffsetsByPositionId);
    };

    if (
      previousItemsPerRowMap === undefined ||
      !isEqual(itemsPerRowMap, previousItemsPerRowMap) ||
      !isEqual(recommendations?.sorts, previousSorts)
    ) {
      // Only re-apportion grid recommendations if recommendations or any itemsPerRow changed
      apportionGridRecommendations();
    }
  }, [recommendations?.sorts, previousSorts, itemsPerRowMap, previousItemsPerRowMap]);

  const startingRowNumbersMap = useMemo(() => {
    const getTotalRowsForSort = (
      sort: TOmniRecommendationSort,
      positionId: number,
    ): number | null => {
      if (sort.numberOfRows !== undefined) {
        if (sort.numberOfRows === 0 || sort.numberOfRows === 1) {
          return sort.numberOfRows;
        }

        const gridRecs = gridRecommendationsMap.get(positionId);
        const itemsPerRow = itemsPerRowMap.get(positionId);

        if (gridRecs && itemsPerRow) {
          return Math.ceil(gridRecs.length / itemsPerRow);
        }

        // We are still calculating the rows for this sort
        return null;
      }

      // BE did not send numberOfRows for this sort
      window.EventTracker?.fireEvent(homePage.missingNumberOfRowsForLoggingErrorEvent);

      return 1;
    };

    const rowNumbersMap: TStartingRowNumbersMap = new Map();
    let currentStartingRow: number | undefined = 0;

    recommendations?.sorts.forEach((sort, positionId) => {
      if (currentStartingRow) {
        rowNumbersMap.set(positionId, currentStartingRow);
      }

      const totalRowsForSort = getTotalRowsForSort(sort, positionId);

      if (currentStartingRow !== undefined && totalRowsForSort !== null) {
        currentStartingRow += totalRowsForSort;
      } else {
        // Make this and all future row numbers invalid
        currentStartingRow = undefined;
      }
    });

    return rowNumbersMap;
  }, [gridRecommendationsMap, itemsPerRowMap, recommendations?.sorts]);

  const homeFeedRef = useRef<HTMLDivElement>(null);

  const getItemsPerRow = useCallback(
    (sort: TOmniRecommendationGameSort, homeFeedWidth: number) => {
      if (isDynamicLayoutSizingEnabled || sort.treatmentType === TTreatmentType.InterestGrid) {
        const componentType = sort.topicLayoutData?.componentType;

        // Subtract one pixel buffer from homeFeedWidth due to Firefox calc() rounding issue
        const containerBufferWidth = 1;

        // Enable new horizontal scroll on EventTile carousels for all users
        const isHorizontalScrollEnabled =
          isCarouselHorizontalScrollEnabled || componentType === TComponentType.EventTile;

        return getNumTilesPerRow(
          homeFeedWidth,
          containerBufferWidth,
          componentType,
          isHorizontalScrollEnabled,
          sort?.treatmentType,
          sort?.recommendationList?.length,
        );
      }

      const useWideGameTiles = isWideTileComponentType(sort.topicLayoutData?.componentType);

      if (useWideGameTiles) {
        if (homeFeedWidth && homeFeedWidth < homePage.wideGameTileTilesPerRowBreakpointWidth) {
          return homePage.minWideGameTilesPerCarouselPage;
        }
        return homePage.maxWideGameTilesPerCarouselPage;
      }

      if (homeFeedWidth && homeFeedWidth < homePage.homeFeedMaxWidth) {
        return Math.max(1, Math.floor(homeFeedWidth / homePage.gameTileWidth));
      }

      return homePage.maxTilesPerCarouselPage;
    },
    [isDynamicLayoutSizingEnabled, isCarouselHorizontalScrollEnabled],
  );

  const updateItemsPerRow = useCallback(
    (homeFeedWidth: number) => {
      const allItemsPerRow = new Map<number, number>();

      recommendations?.sorts.forEach((sort, positionId) => {
        if (
          sort.treatmentType === TTreatmentType.SortlessGrid ||
          sort.treatmentType === TTreatmentType.InterestGrid ||
          (isDynamicLayoutSizingEnabled && sort.treatmentType === TTreatmentType.Carousel)
        ) {
          allItemsPerRow.set(positionId, getItemsPerRow(sort, homeFeedWidth));
        }
      });

      setItemsPerRowMap(allItemsPerRow);
    },
    [recommendations?.sorts, getItemsPerRow, isDynamicLayoutSizingEnabled],
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      const homeFeedWidth = homeFeedRef?.current?.getBoundingClientRect().width;

      if (homeFeedWidth) {
        document.documentElement.style.setProperty("--home-feed-width", `${homeFeedWidth}px`);

        updateItemsPerRow(homeFeedWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateItemsPerRow]);

  return {
    homeFeedRef,
    gridRecommendationsMap,
    itemsPerRowMap,
    startingRowNumbersMap,
    topicPositionOffsetsMap,
  };
};

export default useApportionGridRecommendationsWithResize;
