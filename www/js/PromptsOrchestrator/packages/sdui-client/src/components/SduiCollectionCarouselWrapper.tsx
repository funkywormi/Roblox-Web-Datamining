"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTokens } from "@rbx/core-scripts/react";
import { CollectionCarousel, CollectionItemSize } from "@rbx/discovery-sdui-components";
import { useCollectionItemsIntersectionTracker } from "@rbx/unified-logging";
import {
  buildCollectionAnalyticsData,
  buildItemAnalyticsData,
  computeIsWideTiles,
  createImpressionContext,
  expandManagedList,
  isValidCollectionAnalyticsData,
  reportImpressions,
  type ItemAnalyticsData,
  type SduiComponentConfig,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
} from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import { toV1CollectionItemSize } from "../utils/v1Adapters";

const COLLECTION_COMPONENT_TYPE = "COLLECTION_CAROUSEL";

export interface SduiCollectionCarouselProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining CollectionCarousel schema features
  collectionItemSize?: string;
  headerComponent?: React.ReactNode;
  maxItemsToShow?: number;
  scrollThresholdFromEnd?: number;
  items?: SduiManagedChildList;
  numColumnsOverride?: number;
  /**
   * When defined, looks up in `registry`; otherwise falls back to default item
   * impression log.
   */
  impressionEventName?: string;
  /** when true, skips the item impression log. */
  skipItemImpressionsLog?: boolean;
}

// TODO(ltao): migrate this wrapper onto the shared useSduiCollectionItems hook in a follow-up PR (carousel serves production traffic; keeping it untouched here).
/**
 * CSR-only horizontal carousel. Wraps the V1 `CollectionCarousel` component
 * from `@rbx/discovery-sdui-components`.
 */
export function SduiCollectionCarousel({
  analyticsContext,
  collectionItemSize,
  headerComponent,
  maxItemsToShow,
  scrollThresholdFromEnd,
  items,
  numColumnsOverride,
  impressionEventName,
  skipItemImpressionsLog,
}: SduiCollectionCarouselProps) {
  const tokens = useTokens();
  const services = useSduiServices();
  const { pageContext } = services;

  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const [itemsPerRow, setItemsPerRow] = useState(-1);
  const itemConfigs: SduiComponentConfig[] = items?.configs ?? [];
  const totalNumberOfItems = itemConfigs.length;

  const collectionAnalyticsData = useMemo(
    () =>
      buildCollectionAnalyticsData(
        analyticsContext,
        {
          itemsPerRow,
          totalNumberOfItems,
          collectionComponentType: COLLECTION_COMPONENT_TYPE,
          isWideTiles: computeIsWideTiles(items?.configs ?? []),
        },
        pageContext,
        services.errorReporter,
      ),
    [
      analyticsContext,
      items?.configs,
      itemsPerRow,
      totalNumberOfItems,
      pageContext,
      services.errorReporter,
    ],
  );

  analyticsContext?.setCollectionData?.(collectionAnalyticsData);

  const itemAnalyticsDatasRef = useRef<(ItemAnalyticsData | null)[]>([]);

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
    (config: SduiComponentConfig, index: number, _isVisible: boolean): React.JSX.Element => {
      itemAnalyticsDatasRef.current[index] = buildItemAnalyticsData(
        config.analyticsContext,
        index,
        pageContext,
        services.errorReporter,
      );
      return items?.renderItem(config, index) ?? <React.Fragment key={index} />;
    },
    [items, pageContext, services.errorReporter],
  );

  const resolvedHeader = headerComponent ? expandManagedList(headerComponent) : null;
  const resolvedLayoutOverrides = {
    numColumns: numColumnsOverride,
    fractionalItemAmount: maxItemsToShow,
  };

  // Cast CollectionCarousel to a React.ComponentType to avoid react package discrepancy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CollectionCarouselWrapper = CollectionCarousel as React.ComponentType<any>;

  return (
    <div>
      <CollectionCarouselWrapper
        itemsContainerRef={itemsContainerRef}
        items={itemConfigs}
        renderItem={renderItem}
        collectionItemSize={toV1CollectionItemSize(collectionItemSize) ?? CollectionItemSize.Small}
        updateItemsPerRow={setItemsPerRow}
        headerComponent={resolvedHeader}
        layoutOverrides={resolvedLayoutOverrides}
        gapBetweenHeaderAndItems={tokens.Gap.Large}
        isHorizontalScrollEnabled
        scrollArrowBackgroundColor={tokens.Color.Surface.Surface_100}
        scrollArrowBoxShadowColor={tokens.Color.Common.Shadow}
        thresholdFromEnd={scrollThresholdFromEnd}
      />
    </div>
  );
}
