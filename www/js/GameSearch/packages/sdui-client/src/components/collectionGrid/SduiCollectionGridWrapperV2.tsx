"use client";

import React, { Children, useMemo, useState } from "react";
import {
  expandManagedList,
  parseCollectionItemSize,
  resolveCollectionColumnCount,
  type SduiDim,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
} from "@rbx/sdui-core";
import { useSduiCollectionItems } from "../useSduiCollectionItems";
import { capCollectionItemConfigs, SduiCollectionGridV2 } from "./SduiCollectionGridV2";

const COLLECTION_COMPONENT_TYPE = "COLLECTION_GRID";
const STANDARD_COLLECTION_ITEM_SIZE = "Small";
const LARGE_GAP = "var(--gap-large)";

export interface SduiCollectionGridWrapperV2Props extends SduiRendererInjectedProps {
  headerComponent?: React.ReactNode | SduiManagedChildList;
  items?: SduiManagedChildList;
  collectionItemSize?: string;
  itemHeightFromWidth?: SduiDim;
  maxNumRows?: number;
  impressionEventName?: string;
  skipItemImpressionsLog?: boolean;
}

export function SduiCollectionGridWrapperV2({
  analyticsContext,
  headerComponent,
  items,
  collectionItemSize,
  itemHeightFromWidth,
  maxNumRows,
  impressionEventName,
  skipItemImpressionsLog,
}: SduiCollectionGridWrapperV2Props): React.JSX.Element | null {
  const resolvedCollectionItemSize =
    parseCollectionItemSize(collectionItemSize) ?? STANDARD_COLLECTION_ITEM_SIZE;
  const initialItemsPerRow =
    items?.poolLayout?.columnCount ??
    resolveCollectionColumnCount(resolvedCollectionItemSize, undefined);
  const [itemsPerRow, setItemsPerRow] = useState(initialItemsPerRow);
  const collectionItems = useMemo(() => {
    if (!items) return undefined;

    const configs = capCollectionItemConfigs(
      items.configs,
      items.poolLayout?.columnCount ?? itemsPerRow,
      maxNumRows,
      items.poolLayout,
    );
    return configs === items.configs ? items : { ...items, configs };
  }, [items, itemsPerRow, maxNumRows]);
  const { itemsContainerRef, itemConfigs, renderItem } = useSduiCollectionItems({
    analyticsContext,
    items: collectionItems,
    collectionComponentType: COLLECTION_COMPONENT_TYPE,
    itemsPerRowOverride: items?.poolLayout?.columnCount ?? itemsPerRow,
    impressionEventName,
    skipItemImpressionsLog,
  });

  const resolvedHeader = headerComponent ? expandManagedList(headerComponent) : null;
  if (itemConfigs.length === 0 && Children.count(resolvedHeader) === 0) {
    return null;
  }

  return (
    <div data-testid="sdui-collection-grid-wrapper-v2">
      <SduiCollectionGridV2
        items={collectionItems}
        itemsContainerRef={itemsContainerRef}
        itemConfigs={itemConfigs}
        renderItem={renderItem}
        headerComponent={resolvedHeader}
        gapBetweenHeaderAndItems={LARGE_GAP}
        collectionItemSize={resolvedCollectionItemSize}
        itemHeightFromWidth={itemHeightFromWidth}
        maxNumRows={maxNumRows}
        onItemsPerRowChange={setItemsPerRow}
      />
    </div>
  );
}
