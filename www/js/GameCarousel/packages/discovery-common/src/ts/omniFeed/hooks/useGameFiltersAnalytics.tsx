import { useCallback, useEffect, useRef } from "react";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { observeVisibility } from "@rbx/core-scripts/util/element-visibility";
import { TExploreApiFiltersSort } from "../../common/types/bedev2Types";
import eventStreamConstants, {
  EventStreamMetadata,
  SessionInfoType,
  TFilterImpressions,
  TGamesFilterButton,
  TGamesFilterClick,
} from "../../common/constants/eventStreamConstants";
import { usePageSession } from "../../common/utils/PageSessionContext";
import { PageContext } from "../../common/types/pageContext";
import getOptionContextTag from "../utils/getOptionContextTag";

import { common } from "../../common/constants/configConstants";

export type TSendFilterClickEvent = (
  filterId: string,
  buttonName: TGamesFilterButton,
  selectedOptionId: string,
  previousOptionId?: string,
  isActive?: boolean,
  selectedOptionContextTag?: string,
  previousOptionContextTag?: string,
) => void;

/**
 * Builds properties for and sends the filterImpressions event when the filtersContainerRef
 * is seen in viewport for the first time via IntersectionObserver
 * Generates a sendFilterClickEvent function to send the gamesFilterClick event
 */
const useGameFiltersAnalytics = (
  sort: TExploreApiFiltersSort,
  positionId: number,
  filtersContainerRef: React.RefObject<HTMLDivElement>,
): TSendFilterClickEvent => {
  const discoverPageSessionInfo = usePageSession();

  const disconnectRef = useRef<VoidFunction | null>(null);

  const buildFilterImpressionsEventProperties = useCallback((): TFilterImpressions => {
    return {
      [EventStreamMetadata.AbsPositions]: sort.filters.map((_, index) => index),
      [EventStreamMetadata.FilterIds]: sort.filters.map(filter => filter.filterId),
      [EventStreamMetadata.SelectedOptionIds]: sort.filters.map(filter => filter.selectedOptionId),
      [EventStreamMetadata.GameSetTypeId]: sort.topicId,
      [EventStreamMetadata.GameSetTargetId]: sort.gameSetTargetId,
      [EventStreamMetadata.SortPos]: positionId,
      [SessionInfoType.DiscoverPageSessionInfo]: discoverPageSessionInfo,
      [EventStreamMetadata.Page]: PageContext.GamesPage,
      [EventStreamMetadata.SelectedOptionContextTags]: sort.filters.map(
        filter => getOptionContextTag(filter.selectedOptionId, filter.filterOptions) ?? "0",
      ),
    };
  }, [sort.filters, sort.topicId, sort.gameSetTargetId, positionId, discoverPageSessionInfo]);

  useEffect(() => {
    const onObserve = (isVisible: boolean) => {
      if (isVisible) {
        const eventProperties = buildFilterImpressionsEventProperties();
        const eventParams = eventStreamConstants.filterImpressions(eventProperties);
        if (eventParams) {
          sendEvent(...eventParams);
        }

        // Disconnect the IntersectionObserver after the first impression
        if (disconnectRef?.current) {
          disconnectRef.current();
        }
      }
    };

    if (filtersContainerRef?.current) {
      disconnectRef.current = observeVisibility(
        {
          element: filtersContainerRef.current,
          threshold: common.filterImpressionsIntersectionThreshold,
        },
        onObserve,
      );
    }

    return () => {
      if (disconnectRef?.current) {
        disconnectRef.current();
      }
    };
  }, [buildFilterImpressionsEventProperties, filtersContainerRef]);

  const buildFilterClickEventProperties = useCallback(
    (
      filterId: string,
      buttonName: TGamesFilterButton,
      selectedOptionId: string,
      previousOptionId?: string,
      isActive?: boolean,
      selectedOptionContextTag?: string,
      previousOptionContextTag?: string,
    ): TGamesFilterClick | undefined => {
      return {
        [EventStreamMetadata.ButtonName]: buttonName,
        [EventStreamMetadata.GameSetTypeId]: sort.topicId,
        [EventStreamMetadata.GameSetTargetId]: sort.gameSetTargetId,
        [EventStreamMetadata.SortPos]: positionId,
        [SessionInfoType.DiscoverPageSessionInfo]: discoverPageSessionInfo,
        [EventStreamMetadata.Page]: PageContext.GamesPage,
        [EventStreamMetadata.FilterId]: filterId,
        [EventStreamMetadata.SelectedOptionId]: selectedOptionId,
        [EventStreamMetadata.SelectedOptionContextTag]: selectedOptionContextTag,
        ...(previousOptionId && {
          [EventStreamMetadata.PreviousOptionId]: previousOptionId,
          [EventStreamMetadata.PreviousOptionContextTag]: previousOptionContextTag,
        }),
        [EventStreamMetadata.IsActive]: isActive,
      };
    },
    [sort.topicId, sort.gameSetTargetId, positionId, discoverPageSessionInfo],
  );

  const sendFilterClickEvent = useCallback(
    (
      filterId: string,
      buttonName: TGamesFilterButton,
      selectedOptionId: string,
      previousOptionId?: string,
      isActive?: boolean,
      selectedOptionContextTag?: string,
      previousOptionContextTag?: string,
    ) => {
      const eventProperties = buildFilterClickEventProperties(
        filterId,
        buttonName,
        selectedOptionId,
        previousOptionId,
        isActive,
        selectedOptionContextTag,
        previousOptionContextTag,
      );
      const eventParams = eventStreamConstants.gamesFilterClick(eventProperties);
      if (eventParams) {
        sendEvent(...eventParams);
      }
    },
    [buildFilterClickEventProperties],
  );

  return sendFilterClickEvent;
};

export default useGameFiltersAnalytics;
