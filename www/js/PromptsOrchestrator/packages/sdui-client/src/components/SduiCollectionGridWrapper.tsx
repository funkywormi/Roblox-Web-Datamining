"use client";
import React from "react";
import { useTokens } from "@rbx/core-scripts/react";
import { CollectionGrid, CollectionItemSize } from "@rbx/discovery-sdui-components";
import {
  expandManagedList,
  Loading,
  LoadMoreSentinel,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
} from "@rbx/sdui-core";
import { useSduiLoadMorePagination } from "@rbx/sdui-core/client";
import { toV1CollectionItemSize } from "../utils/v1Adapters";
import { useSduiCollectionItems } from "./useSduiCollectionItems";

const COLLECTION_COMPONENT_TYPE = "COLLECTION_GRID";

export interface SduiCollectionGridProps extends SduiRendererInjectedProps {
  onReachedThresholdFromEnd?: SduiResolvedAction;
  collectionItemSize?: string;
  headerComponent?: React.ReactNode | SduiManagedChildList;
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

/** CSR-only vertical grid (e.g. the Charts "See All" page) wrapping the V1 `CollectionGrid` primitive. */
export function SduiCollectionGrid({
  analyticsContext,
  onReachedThresholdFromEnd,
  collectionItemSize,
  headerComponent,
  items,
  numColumnsOverride,
  impressionEventName,
  skipItemImpressionsLog,
}: SduiCollectionGridProps) {
  const tokens = useTokens();
  const { triggerLoadMore, hasNextPage, dataUpdatedTimestamp, isLoadingMore } =
    useSduiLoadMorePagination({ onLoadMore: onReachedThresholdFromEnd });
  const { itemsContainerRef, itemConfigs, setItemsPerRow, renderItem } = useSduiCollectionItems({
    analyticsContext,
    items,
    collectionComponentType: COLLECTION_COMPONENT_TYPE,
    impressionEventName,
    skipItemImpressionsLog,
  });

  const resolvedHeader = headerComponent ? expandManagedList(headerComponent) : null;
  const resolvedLayoutOverrides =
    numColumnsOverride != null ? { numColumns: numColumnsOverride } : undefined;

  return (
    <div className="padding-top-large">
      <CollectionGrid
        itemsContainerRef={itemsContainerRef}
        items={itemConfigs}
        renderItem={renderItem}
        collectionItemSize={toV1CollectionItemSize(collectionItemSize) ?? CollectionItemSize.Small}
        updateItemsPerRow={setItemsPerRow}
        headerComponent={resolvedHeader}
        layoutOverrides={resolvedLayoutOverrides}
        gapBetweenHeaderAndItems={tokens.Gap.Large}
      />
      {isLoadingMore ? <Loading ariaLabel="Loading more content" /> : null}
      {hasNextPage ? (
        <LoadMoreSentinel
          onLoadMore={triggerLoadMore}
          dataUpdatedTimestamp={dataUpdatedTimestamp}
        />
      ) : null}
    </div>
  );
}
