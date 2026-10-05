import React, { useCallback, useMemo, useRef, useState } from "react";
import { useCollectionItemsIntersectionTracker } from "@rbx/unified-logging";
import {
  buildCollectionAnalyticsData,
  buildItemAnalyticsData,
  computeIsWideTiles,
  createImpressionContext,
  isValidCollectionAnalyticsData,
  reportImpressions,
  type AnalyticsContext,
  type ItemAnalyticsData,
  type SduiComponentConfig,
  type SduiManagedChildList,
} from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";

export interface UseSduiCollectionItemsArgs {
  analyticsContext?: AnalyticsContext;
  items?: SduiManagedChildList;
  /** Logged on the collection analytics record, e.g. "COLLECTION_CAROUSEL" / "COLLECTION_GRID". */
  collectionComponentType: string;
  /**
   * When defined, looks up in `registry`; otherwise falls back to default item
   * impression log.
   */
  impressionEventName?: string;
  /** when true, skips the item impression log. */
  skipItemImpressionsLog?: boolean;
}

export interface SduiCollectionItems {
  itemsContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  itemConfigs: SduiComponentConfig[];
  setItemsPerRow: (value: number) => void;
  renderItem: (
    config: SduiComponentConfig,
    index: number,
    isVisible?: boolean,
  ) => React.JSX.Element;
}

/**
 * Shared spine for SDUI collection wrappers (carousel, grid, …). Owns item
 * config extraction, collection + item analytics, and impression tracking so
 * each wrapper only supplies its layout primitive — the behavior here is
 * identical across collection types; only the rendered primitive and
 * `collectionComponentType` differ.
 */
export function useSduiCollectionItems({
  analyticsContext,
  items,
  collectionComponentType,
  impressionEventName,
  skipItemImpressionsLog,
}: UseSduiCollectionItemsArgs): SduiCollectionItems {
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
          collectionComponentType,
          isWideTiles: computeIsWideTiles(items?.configs ?? []),
        },
        pageContext,
        services.errorReporter,
      ),
    [
      analyticsContext,
      collectionComponentType,
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
    (config: SduiComponentConfig, index: number, _isVisible?: boolean): React.JSX.Element => {
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

  return { itemsContainerRef, itemConfigs, setItemsPerRow, renderItem };
}
