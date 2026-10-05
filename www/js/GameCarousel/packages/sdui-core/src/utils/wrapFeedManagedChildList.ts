import type React from "react";

import { applyFeedEntryAnalytics } from "../analytics/applyFeedEntryAnalytics";
import type { SduiComponentConfig, SduiManagedChildList } from "../types";

/**
 * Wraps a renderer-produced managed child list so each vertical-feed entry
 * receives analytics before the generic list-item overlay runs inside
 * `SduiRenderer`.
 *
 * Use offset `0` for the sticky lane. For the scrolling feed, pass the sticky
 * collection count so `collectionPosition` continues past pinned collections.
 */
export function wrapFeedManagedChildList(
  list: SduiManagedChildList,
  collectionPositionOffset = 0,
): SduiManagedChildList {
  return {
    configs: list.configs,
    renderItem: (childConfig: SduiComponentConfig, index: number, reactKey?: React.Key) => {
      applyFeedEntryAnalytics(childConfig, index, collectionPositionOffset);
      return list.renderItem(childConfig, index, reactKey);
    },
  };
}
