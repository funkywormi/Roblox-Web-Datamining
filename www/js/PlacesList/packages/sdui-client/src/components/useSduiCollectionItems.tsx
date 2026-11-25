import React, { useCallback, useMemo, useRef, useState } from "react";
import { useCollectionItemsIntersectionTracker } from "@rbx/unified-logging";
import {
  buildCollectionAnalyticsData,
  buildItemAnalyticsData,
  computeIsWideTiles,
  createImpressionContext,
  isValidCollectionAnalyticsData,
  materializeSduiComponentConfig,
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
  itemsPerRowOverride?: number;
  /**
   * When defined, looks up in `registry`; otherwise falls back to default item
   * impression log.
   */
  impressionEventName?: string;
  /** when true, skips the item impression log. */
  skipItemImpressionsLog?: boolean;
  /** 1-based starting row of this section in a pooled feed (fallback when `items.poolLayout` is absent). */
  startRowNumber?: number;
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
  itemsPerRowOverride,
  impressionEventName,
  skipItemImpressionsLog,
  startRowNumber,
}: UseSduiCollectionItemsArgs): SduiCollectionItems {
  const services = useSduiServices();
  const { pageContext } = services;

  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const [measuredItemsPerRow, setMeasuredItemsPerRow] = useState(-1);
  const itemsPerRow = itemsPerRowOverride ?? measuredItemsPerRow;
  const itemConfigs: SduiComponentConfig[] = items?.configs ?? [];
  const totalNumberOfItems = itemConfigs.length;
  const isPooled = items?.poolLayout !== undefined;
  const resolvedStartRowNumber = items?.poolLayout?.startRow ?? startRowNumber;
  // Wide-tile layout reads props from the first item; materialize deferred shells first.
  const isWideTiles = useMemo(() => {
    const firstItem = items?.configs[0];
    if (firstItem != null) {
      materializeSduiComponentConfig(firstItem);
    }
    return computeIsWideTiles(items?.configs ?? []);
  }, [items?.configs]);

  const collectionAnalyticsData = useMemo(
    () =>
      buildCollectionAnalyticsData(
        analyticsContext,
        {
          itemsPerRow,
          totalNumberOfItems,
          collectionComponentType,
          isWideTiles,
          startRowNumber: resolvedStartRowNumber,
        },
        pageContext,
        services.errorReporter,
      ),
    [
      analyticsContext,
      collectionComponentType,
      isWideTiles,
      resolvedStartRowNumber,
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
        startRowNumber: resolvedStartRowNumber,
        itemCellIndexes: isPooled
          ? items.configs.map((config, index) => config.poolPlacement?.cellIndex ?? index)
          : undefined,
        impressionEventName,
        skipItemImpressionsLog,
      });
    },
    [
      impressionCtx,
      services.impressionHandlerRegistry,
      collectionAnalyticsData,
      resolvedStartRowNumber,
      items?.configs,
      isPooled,
      itemsPerRow,
      impressionEventName,
      skipItemImpressionsLog,
    ],
  );

  useCollectionItemsIntersectionTracker(itemsContainerRef, itemConfigs.length, onItemsImpressed);

  const renderItem = useCallback(
    (config: SduiComponentConfig, index: number, _isVisible?: boolean): React.JSX.Element => {
      // Materialize and invoke `items.renderItem` first so SduiRenderer's
      // `addListItemAnalytics` populates `itemComponentType` and `itemPosition`
      // on the item's own snapshot before `buildItemAnalyticsData` reads it.
      const materializedConfig = materializeSduiComponentConfig(config);
      if (materializedConfig == null) {
        itemAnalyticsDatasRef.current[index] = null;
        return <React.Fragment key={index} />;
      }
      const rendered = items?.renderItem(materializedConfig, index) ?? (
        <React.Fragment key={index} />
      );
      itemAnalyticsDatasRef.current[index] = buildItemAnalyticsData(
        materializedConfig.analyticsContext,
        index,
        pageContext,
        services.errorReporter,
        config.poolPlacement ? config.poolPlacement.poolIndex + 1 : undefined,
      );
      return rendered;
    },
    [items, pageContext, services.errorReporter],
  );

  return { itemsContainerRef, itemConfigs, setItemsPerRow: setMeasuredItemsPerRow, renderItem };
}
