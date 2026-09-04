import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { useCollectionItemsIntersectionTracker } from "@rbx/unified-logging";
import {
  createImpressionContext,
  isValidCollectionAnalyticsData,
  reportImpressions,
  type FilterPillsInputDataFilterGroup,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
} from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import { usePageSession } from "../../../../common/utils/PageSessionContext";
import VariableItemWidthCarousel from "../../../../common/components/VariableItemWidthCarousel";
import { buildSessionAnalyticsData, resolvePageForReferral } from "../../utils/pageReferralUtils";
import {
  buildFilterPillItemAnalyticsData,
  buildFilterPillsCollectionAnalyticsData,
} from "../../utils/filterImpressionsParamsUtils";
import FilterPill, { type FilterClickButtonName } from "./FilterPill";
import {
  buildFilterSelections,
  getEffectiveSelectedOptionId,
  isActiveSelection,
  type PendingApply,
} from "./filterPillsSelectionUtils";

// Returns undefined (not the "0" impression sentinel) so absent tags are omitted from click event params.
function getOptionContextTag(
  selectedOptionId: string | undefined,
  filterOptions: FilterPillsInputDataFilterGroup["options"],
): string | undefined {
  if (!selectedOptionId) {
    return undefined;
  }
  const option = filterOptions.find(option => option.optionId === selectedOptionId);
  return option?.optionContextTag !== "" ? option?.optionContextTag : undefined;
}

export type SduiFilterPillsCarouselProps = SduiRendererInjectedProps & {
  filterGroups?: FilterPillsInputDataFilterGroup[];
  impressionEventName?: string;
  skipItemImpressionsLog?: boolean;
  onFilterApplied?: SduiResolvedAction;
  onFilterClick?: SduiResolvedAction;
  title?: string;
};

export function SduiFilterPillsCarousel({
  analyticsContext,
  filterGroups = [],
  impressionEventName,
  skipItemImpressionsLog,
  onFilterApplied,
  onFilterClick,
  title,
}: SduiFilterPillsCarouselProps): React.JSX.Element | null {
  const services = useSduiServices();
  const pageSessionInfo = usePageSession();
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);

  // Optimistic selection for mounted refetch surfaces; Charts unmounts on apply so it is not visible there today.
  const [pendingApply, setPendingApply] = useState<PendingApply | null>(null);

  // Clears when filterGroups identity changes; failed apply can leave pending stuck until remount (no mounted consumer today).
  useEffect(() => {
    setPendingApply(null);
  }, [filterGroups]);

  const collectionAnalyticsData = useMemo(() => {
    return buildFilterPillsCollectionAnalyticsData(
      analyticsContext,
      filterGroups.length,
      pageSessionInfo,
      services.pageContext,
    );
  }, [analyticsContext, filterGroups.length, pageSessionInfo, services.pageContext]);

  const itemAnalyticsDatas = useMemo(
    () =>
      filterGroups.map((filterGroup, index) =>
        buildFilterPillItemAnalyticsData(filterGroup, index),
      ),
    [filterGroups],
  );

  const impressionCtx = useMemo(() => createImpressionContext(services), [services]);

  const onItemsImpressed = useCallback(
    (indexesToSend: number[]) => {
      if (
        indexesToSend.length === 0 ||
        !collectionAnalyticsData ||
        !isValidCollectionAnalyticsData(collectionAnalyticsData)
      ) {
        return;
      }

      reportImpressions({
        ctx: impressionCtx,
        registry: services.impressionHandlerRegistry,
        impressionIndexes: indexesToSend,
        itemAnalyticsDatas,
        collectionAnalyticsData,
        impressionEventName,
        skipItemImpressionsLog,
      });
    },
    [
      collectionAnalyticsData,
      impressionCtx,
      impressionEventName,
      itemAnalyticsDatas,
      services.impressionHandlerRegistry,
      services.pageContext,
      skipItemImpressionsLog,
    ],
  );

  useCollectionItemsIntersectionTracker(itemsContainerRef, filterGroups.length, onItemsImpressed);

  const reportFilterClick = useCallback(
    (
      filterGroup: FilterPillsInputDataFilterGroup,
      buttonName: FilterClickButtonName,
      nextOptionId: string,
      previousOptionId?: string,
      isActive?: boolean,
    ) => {
      if (!services.pageContext) {
        return;
      }

      onFilterClick?.onActivated({
        buttonName,
        filterId: filterGroup.filterId,
        filterType: filterGroup.filterType,
        selectedOptionId: nextOptionId,
        previousOptionId,
        isActive,
        selectedOptionContextTag: getOptionContextTag(nextOptionId, filterGroup.options),
        previousOptionContextTag: getOptionContextTag(previousOptionId, filterGroup.options),
        ...buildSessionAnalyticsData(pageSessionInfo, services.pageContext),
        page: resolvePageForReferral(services.pageContext),
      });
    },
    [onFilterClick, pageSessionInfo, services.pageContext],
  );

  const applyFilter = useCallback(
    (filterGroup: FilterPillsInputDataFilterGroup, selectedOptionId: string) => {
      if (!onFilterApplied) {
        return;
      }

      const nextPendingApply: PendingApply = {
        filterType: filterGroup.filterType,
        optionId: selectedOptionId,
      };
      const nextSelections = buildFilterSelections(filterGroups, nextPendingApply);

      setPendingApply(nextPendingApply);
      onFilterApplied.onActivated({ filterSelections: nextSelections });
    },
    [filterGroups, onFilterApplied],
  );

  const renderItem = useCallback(
    (filterGroup: FilterPillsInputDataFilterGroup) => {
      const effectiveSelectedOptionId = getEffectiveSelectedOptionId(filterGroup, pendingApply);
      const active = isActiveSelection(filterGroup, effectiveSelectedOptionId);

      return (
        <FilterPill
          filterGroup={filterGroup}
          effectiveSelectedOptionId={effectiveSelectedOptionId}
          isActive={active}
          onFilterClick={reportFilterClick}
          onApplyFilter={applyFilter}
        />
      );
    },
    [applyFilter, pendingApply, reportFilterClick],
  );

  const getKey = useCallback(
    (filterGroup: FilterPillsInputDataFilterGroup, index: number) =>
      filterGroup.filterId || `${filterGroup.filterType}-${index}`,
    [],
  );

  if (filterGroups.length === 0) {
    return null;
  }

  return (
    <div className="filters-container" data-testid="sdui-filter-pills-carousel">
      {title ? (
        <div className="filters-header-container">
          <h2>{title}</h2>
        </div>
      ) : null}
      <VariableItemWidthCarousel
        items={filterGroups}
        renderItem={renderItem}
        getKey={getKey}
        itemGapClassName="gap-small"
        containerClassName="filter-items-container"
        isNewScrollArrowsEnabled
        scrollButtonsEnabled={false}
        itemsContainerRef={itemsContainerRef}
      />
    </div>
  );
}

export default SduiFilterPillsCarousel;
