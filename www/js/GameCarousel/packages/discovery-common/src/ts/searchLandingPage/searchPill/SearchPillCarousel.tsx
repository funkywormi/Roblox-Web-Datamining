import React, { useCallback, useContext, useRef } from "react";
import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { PageContext } from "../../common/types/pageContext";
import { getSessionInfoTypeFromPageContext } from "../../common/utils/parsingUtils";
import eventStreamConstants, {
  EventStreamMetadata,
  getEventContext,
} from "../../common/constants/eventStreamConstants";
import { TExploreApiSearchPillsSort, TQueryData } from "../../common/types/bedev2Types";
import SearchPill from "./SearchPill";
import SearchLandingPageSessionContext from "../SearchLandingPageSessionContext";
import GameCarouselContainerHeader from "../../common/components/GameCarouselContainerHeader";
import VariableItemWidthCarousel from "../../common/components/VariableItemWidthCarousel";
import useSearchPillCarouselImpressionTracker from "../hooks/useSearchPillCarouselImpressionTracker";

type TSearchPillCarouselProps = {
  sort: TExploreApiSearchPillsSort;
  positionId: number;
  isNewScrollArrowsEnabled?: boolean;
  isNewSortHeaderEnabled?: boolean;
  translate: TranslateFunction;
};

const getKey = (queryData: TQueryData, index: number): string => {
  return `${queryData.query}-${index}`;
};

const SearchPillCarousel = ({
  sort,
  positionId,
  isNewScrollArrowsEnabled,
  isNewSortHeaderEnabled,
  translate,
}: TSearchPillCarouselProps): React.JSX.Element => {
  const sessionInfo = useContext(SearchLandingPageSessionContext);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const page = PageContext.SearchLandingPage;

  useSearchPillCarouselImpressionTracker(
    containerRef,
    sort.queries,
    sort.sortId,
    positionId,
    sort.topicLayoutData?.componentType,
    sessionInfo,
    page,
  );

  const onPillClick = useCallback(
    (query: string, index: number) => {
      const sessionInfoType = getSessionInfoTypeFromPageContext(page);
      const componentType = sort.topicLayoutData?.componentType;

      // Note: indices are incremented to match Universal App (1-indexed)
      const [eventConfig, eventParams] = eventStreamConstants.querySuggestionClicked({
        [EventStreamMetadata.Pos]: index + 1,
        [EventStreamMetadata.QueryText]: query,
        [EventStreamMetadata.ComponentType]: componentType,
        [EventStreamMetadata.SortPos]: positionId + 1,
        [EventStreamMetadata.SortId]: sort.sortId,
        [EventStreamMetadata.Context]: getEventContext(page),
        ...(sessionInfoType && sessionInfo && { [sessionInfoType]: sessionInfo }),
      });
      eventStreamService.sendEvent(eventConfig, eventParams);
    },
    [positionId, sessionInfo, sort.topicLayoutData?.componentType, sort.sortId, page],
  );

  const renderItem = useCallback(
    (queryData: TQueryData, index: number) => {
      return <SearchPill queryText={queryData.query} index={index} onClick={onPillClick} />;
    },
    [onPillClick],
  );

  const headerComponent = (
    <GameCarouselContainerHeader
      sortTitle={sort.topic}
      isNewSortHeaderEnabled={isNewSortHeaderEnabled}
      hideSeeAll
      titleContainerClassName="padding-bottom-small"
      seeAllLink={undefined}
      subtitleLink={undefined}
      shouldShowSeparateSubtitleLink={false}
      isSortLinkOverrideEnabled={false}
      shouldShowSponsoredTooltip={false}
      translate={translate}
    />
  );

  return (
    <VariableItemWidthCarousel
      items={sort.queries}
      renderItem={renderItem}
      getKey={getKey}
      itemGapClassName="gap-small"
      containerClassName="search-pill-carousel-container padding-bottom-large"
      isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
      headerComponent={headerComponent}
      itemsContainerRef={containerRef}
    />
  );
};

export default SearchPillCarousel;
