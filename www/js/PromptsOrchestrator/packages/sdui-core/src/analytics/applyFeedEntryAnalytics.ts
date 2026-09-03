import type { SduiComponentConfig } from "../types";
import { componentTypeName } from "../utils/protoEnum";

/**
 * Vertical-feed entry analytics overlay for sticky and scrolling lanes.
 * Call before rendering the entry so descendants (e.g. collection carousels)
 * see the correct ancestor snapshot.
 *
 * `collectionPositionOffset` is the number of sticky collections pinned above the
 * scrolling feed. Sticky entries call this with offset `0`; feed entries pass the
 * sticky collection count so sticky and scrolling collections share a single
 * `collectionPosition` space.
 */
export function applyFeedEntryAnalytics(
  childConfig: SduiComponentConfig,
  index: number,
  collectionPositionOffset = 0,
): void {
  const feedIndex = index + 1;
  const { componentType } = childConfig;
  const componentName = componentTypeName(componentType);

  childConfig.analyticsContext?.setLocalAnalyticsData?.({
    feedItemPosition: feedIndex,
    itemPosition: feedIndex,
    itemComponentType: componentName,
    // Inherited by descendant collection components: a collection rendered as a
    // feed entry derives its `collectionPosition` from its position in the feed.
    collectionPosition: feedIndex + collectionPositionOffset,
  });
}
