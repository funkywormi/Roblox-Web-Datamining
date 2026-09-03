"use client";
import React from "react";
import { useTokens } from "@rbx/core-scripts/react";
import { CollectionGrid, CollectionItemSize } from "@rbx/discovery-sdui-components";
import { type SduiManagedChildList, type SduiRendererInjectedProps } from "@rbx/sdui-core";
import { toV1CollectionItemSize } from "../utils/v1Adapters";
import { useSduiCollectionItems } from "./useSduiCollectionItems";

const COLLECTION_COMPONENT_TYPE = "COLLECTION_GRID";

export interface SduiCollectionGridProps extends SduiRendererInjectedProps {
  // TODO(ltao): support remaining CollectionGrid schema features (Charts See-All follow-up: ltao/charts-sdui-v2-see-all)
  collectionItemSize?: string;
  headerComponent?: React.ReactNode;
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
  collectionItemSize,
  headerComponent,
  items,
  numColumnsOverride,
  impressionEventName,
  skipItemImpressionsLog,
}: SduiCollectionGridProps) {
  const tokens = useTokens();
  const { itemsContainerRef, itemConfigs, setItemsPerRow, renderItem } = useSduiCollectionItems({
    analyticsContext,
    items,
    collectionComponentType: COLLECTION_COMPONENT_TYPE,
    impressionEventName,
    skipItemImpressionsLog,
  });

  const resolvedHeader = headerComponent ?? null;
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
    </div>
  );
}
