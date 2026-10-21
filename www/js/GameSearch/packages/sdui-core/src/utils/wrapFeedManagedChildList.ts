import type React from "react";

import { applyFeedEntryAnalytics } from "../analytics/applyFeedEntryAnalytics";
import { materializeSduiComponentConfig } from "../binding/deferredSduiComponentConfig";
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
    ...(list.poolLayout ? { poolLayout: list.poolLayout } : {}),
    renderItem: (childConfig: SduiComponentConfig, index: number, reactKey?: React.Key) => {
      // Feed analytics read the config's fields, so a deferred shell must be built first.
      // The renderer materializes again, which is a no-op after this.
      const materializedConfig = materializeSduiComponentConfig(childConfig);
      if (materializedConfig == null) {
        return null;
      }
      applyFeedEntryAnalytics(materializedConfig, index, collectionPositionOffset);
      return list.renderItem(materializedConfig, index, reactKey);
    },
  };
}
