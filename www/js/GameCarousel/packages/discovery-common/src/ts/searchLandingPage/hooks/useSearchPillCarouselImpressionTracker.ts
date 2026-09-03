import { RefObject, useCallback } from "react";
import "@rbx/core-scripts/global";
import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { useCollectionItemsIntersectionTracker } from "@rbx/unified-logging";
import eventStreamConstants, {
  EventStreamMetadata,
  getEventContext,
  TQueryImpressions,
} from "../../common/constants/eventStreamConstants";
import { TQueryData } from "../../common/types/bedev2Types";
import { PageContext } from "../../common/types/pageContext";
import { getSessionInfoTypeFromPageContext } from "../../common/utils/parsingUtils";
import { searchLandingPage } from "../../common/constants/configConstants";

type TBuildSearchPillImpressionsProperties = (
  impressedIndexes: number[],
) => TQueryImpressions | undefined;

const useSearchPillCarouselImpressionTracker = (
  containerRef: RefObject<HTMLDivElement | null>,
  queries: TQueryData[],
  sortId: string,
  sortPosition: number,
  componentType: string | undefined,
  sessionInfo: string | undefined,
  page: PageContext,
): void => {
  const buildSearchPillsImpressionsProperties: TBuildSearchPillImpressionsProperties = useCallback(
    (impressedIndexes: number[]) => {
      if (queries && queries.length > 0) {
        const filteredImpressedIndexes = impressedIndexes.filter(index => index < queries.length);
        const sessionInfoType = getSessionInfoTypeFromPageContext(page);

        // Note: indices are incremented to match Universal App (1-indexed)
        return {
          [EventStreamMetadata.Context]: getEventContext(page),
          [EventStreamMetadata.ComponentType]: componentType,
          [EventStreamMetadata.SortId]: sortId,
          [EventStreamMetadata.SortPos]: sortPosition + 1,
          [EventStreamMetadata.QueryTexts]: filteredImpressedIndexes.map(
            index => queries[index]?.query ?? "0",
          ),
          [EventStreamMetadata.AbsPositions]: filteredImpressedIndexes.map(index => index + 1),
          ...(sessionInfoType && sessionInfo && { [sessionInfoType]: sessionInfo }),
        };
      }

      return undefined;
    },
    [queries, sortId, sortPosition, componentType, sessionInfo, page],
  );

  const onSearchPillsImpressed = useCallback(
    (indexesToSend: number[]) => {
      const params = buildSearchPillsImpressionsProperties(indexesToSend);

      if (params !== undefined) {
        const [eventConfig, eventParams] = eventStreamConstants.queryImpressions(params);
        eventStreamService.sendEvent(eventConfig, eventParams);
      } else {
        window.EventTracker?.fireEvent(
          searchLandingPage.SearchPillCarouselImpressionsUndefinedError,
        );
      }
    },
    [buildSearchPillsImpressionsProperties],
  );

  useCollectionItemsIntersectionTracker(containerRef, queries?.length ?? 0, onSearchPillsImpressed);
};

export default useSearchPillCarouselImpressionTracker;
