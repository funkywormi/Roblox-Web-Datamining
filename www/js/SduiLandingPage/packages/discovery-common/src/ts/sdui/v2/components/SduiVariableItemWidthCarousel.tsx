"use client";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useCollectionItemsIntersectionTracker } from "@rbx/unified-logging";
import {
  UiComponentType,
  SduiSectionHeader,
  buildCollectionAnalyticsData,
  buildItemAnalyticsData,
  componentTypeName,
  createImpressionContext,
  findAnalyticsField,
  isValidCollectionAnalyticsData,
  parseAnalyticsField,
  reportImpressions,
  type SduiComponentConfig,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
} from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import VariableItemWidthCarousel from "../../../common/components/VariableItemWidthCarousel";

const DEFAULT_COLLECTION_COMPONENT_TYPE = "VARIABLE_ITEM_WIDTH_CAROUSEL";

export type SduiVariableItemWidthCarouselProps = SduiRendererInjectedProps & {
  title?: string;
  subtitle?: string;
  items?: SduiManagedChildList;
  itemPadding?: number;
  scrollButtonsEnabled?: boolean;
  impressionEventName?: string;
  skipItemImpressionsLog?: boolean;
};

export function getCarouselItemKey(itemConfig: SduiComponentConfig, index: number): string {
  return (
    itemConfig.reactKey ??
    itemConfig.identifier ??
    `${itemConfig.componentType ?? UiComponentType.INVALID}-${index}`
  );
}

/**
 * SDUI wrapper around the shared web `VariableItemWidthCarousel` with collection
 * impression telemetry parity to lua `SduiVariableItemWidthCarousel`.
 */
export function SduiVariableItemWidthCarousel({
  analyticsContext,
  title,
  subtitle,
  items,
  itemPadding,
  scrollButtonsEnabled = true,
  impressionEventName,
  skipItemImpressionsLog,
  componentType,
}: SduiVariableItemWidthCarouselProps): React.JSX.Element {
  const services = useSduiServices();
  const { pageContext } = services;

  const itemConfigs = items?.configs ?? [];
  const totalNumberOfItems = itemConfigs.length;
  const itemsPerRow = totalNumberOfItems;

  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const itemAnalyticsDatasRef = useRef<(ReturnType<typeof buildItemAnalyticsData> | null)[]>([]);

  if (itemAnalyticsDatasRef.current.length > totalNumberOfItems) {
    itemAnalyticsDatasRef.current.length = totalNumberOfItems;
  }

  // Overlay fields as deps — context identity is stable across setLocalAnalyticsData.
  const analyticsComponentType = findAnalyticsField(
    "componentType",
    analyticsContext?.analyticsData,
  );
  const analyticsSelectedOption = findAnalyticsField(
    "selectedOption",
    analyticsContext?.analyticsData,
  );

  const collectionAnalyticsData = useMemo(
    () => {
      const collectionComponentType =
        parseAnalyticsField(analyticsComponentType, "") ||
        (componentType != null ? componentTypeName(componentType) : "") ||
        DEFAULT_COLLECTION_COMPONENT_TYPE;

      return buildCollectionAnalyticsData(
        analyticsContext,
        {
          itemsPerRow,
          totalNumberOfItems,
          collectionComponentType,
        },
        pageContext,
        services.errorReporter,
      );
    },
    // analyticsSelectedOption overlays mutate analyticsContext in place; keep as
    // a dep so collection analytics rebuilds when the overlay changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional overlay dep
    [
      analyticsContext,
      analyticsComponentType,
      analyticsSelectedOption,
      componentType,
      itemsPerRow,
      totalNumberOfItems,
      pageContext,
      services.errorReporter,
    ],
  );

  useEffect(() => {
    analyticsContext?.setCollectionData?.(collectionAnalyticsData);
  }, [analyticsContext, collectionAnalyticsData]);

  const impressionCtx = useMemo(() => createImpressionContext(services), [services]);

  const onItemsImpressed = useCallback(
    (indexesToSend: number[]) => {
      if (
        indexesToSend.length === 0 ||
        !isValidCollectionAnalyticsData(collectionAnalyticsData) ||
        itemsPerRow <= 0
      ) {
        return;
      }

      reportImpressions({
        ctx: impressionCtx,
        registry: services.impressionHandlerRegistry,
        impressionIndexes: indexesToSend,
        itemAnalyticsDatas: itemAnalyticsDatasRef.current,
        collectionAnalyticsData,
        impressionEventName,
        skipItemImpressionsLog,
      });
    },
    [
      impressionCtx,
      services.impressionHandlerRegistry,
      collectionAnalyticsData,
      itemsPerRow,
      impressionEventName,
      skipItemImpressionsLog,
    ],
  );

  useCollectionItemsIntersectionTracker(itemsContainerRef, itemConfigs.length, onItemsImpressed);

  const renderItem = useCallback(
    (itemConfig: SduiComponentConfig, index: number) => {
      const node = items?.renderItem(itemConfig, index) ?? <React.Fragment key={index} />;

      itemAnalyticsDatasRef.current[index] = buildItemAnalyticsData(
        itemConfig.analyticsContext,
        index,
        pageContext,
        services.errorReporter,
      );

      return node;
    },
    [items, pageContext, services.errorReporter],
  );

  const getKey = useCallback(getCarouselItemKey, []);

  const resolvedHeader =
    title || subtitle ? (
      <div className="padding-bottom-large">
        <SduiSectionHeader titleText={title} subtitleText={subtitle} />
      </div>
    ) : undefined;

  const scrollContainerStyle = useMemo(
    () => (itemPadding != null ? { gap: itemPadding } : undefined),
    [itemPadding],
  );

  return (
    <VariableItemWidthCarousel
      items={itemConfigs}
      renderItem={renderItem}
      getKey={getKey}
      itemGapClassName={itemPadding == null ? "gap-small" : undefined}
      scrollContainerStyle={scrollContainerStyle}
      containerClassName="sdui-variable-item-width-carousel-container"
      isNewScrollArrowsEnabled
      scrollButtonsEnabled={scrollButtonsEnabled}
      headerComponent={resolvedHeader}
      itemsContainerRef={itemsContainerRef}
    />
  );
}

export default SduiVariableItemWidthCarousel;
