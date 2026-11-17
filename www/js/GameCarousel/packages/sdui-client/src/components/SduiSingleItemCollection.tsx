"use client";
import type { SduiManagedChildList, SduiRendererInjectedProps } from "@rbx/sdui-core";
import { useSduiCollectionItems } from "./useSduiCollectionItems";

export interface SduiSingleItemCollectionProps extends SduiRendererInjectedProps {
  item?: SduiManagedChildList;
  impressionEventName?: string;
  skipItemImpressionsLog?: boolean;
}

/** A single lazy child with the same viewport impression tracking as other collections. */
export function SduiSingleItemCollection({
  analyticsContext,
  item,
  impressionEventName,
  skipItemImpressionsLog,
}: SduiSingleItemCollectionProps) {
  const { itemsContainerRef, itemConfigs, renderItem } = useSduiCollectionItems({
    analyticsContext,
    items: item,
    itemsPerRowOverride: 1,
    collectionComponentType: "SINGLE_ITEM_COLLECTION",
    impressionEventName,
    skipItemImpressionsLog,
  });
  const config = itemConfigs[0];

  return (
    <div ref={itemsContainerRef} data-testid="sdui-single-item-collection">
      {config ? renderItem(config, 0) : null}
    </div>
  );
}
