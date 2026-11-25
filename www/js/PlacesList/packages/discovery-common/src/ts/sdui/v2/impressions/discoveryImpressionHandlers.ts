import type { SduiImpressionHandlerConfig } from "@rbx/sdui-core";
import { sduiFilterImpressionsHandler } from "./sduiFilterImpressionsHandler";
import { sduiGameImpressionsHandler } from "./sduiGameImpressionsHandler";
import { safetyResourceBannerImpressionsHandler } from "./safetyResourceBannerImpressionsHandler";

export const DISCOVERY_IMPRESSION_HANDLERS: Record<string, SduiImpressionHandlerConfig> = {
  safetyResourceBannerImpressions: {
    handler: safetyResourceBannerImpressionsHandler,
    skipItemImpressionsLog: true,
  },
  filterImpressions: {
    handler: sduiFilterImpressionsHandler,
    skipItemImpressionsLog: true,
  },
  gameImpressions: {
    handler: sduiGameImpressionsHandler,
    // Diverges from Lua, which sends `itemImpressions` too: live Charts and Search web traffic
    // only sends `gameImpressions`. Surfaces opt in with `DISCOVERY_GAME_ITEM_IMPRESSION_HANDLERS`
    // or with the template's `skip_item_impressions_log = false`.
    skipItemImpressionsLog: true,
  },
};

/**
 * `gameImpressions` that also fires the generic `itemImpressions`, matching Lua
 * `registerDiscoveryImpressions` (`skipItemImpressionsLog = false`).
 */
export const DISCOVERY_GAME_ITEM_IMPRESSION_HANDLERS: Record<string, SduiImpressionHandlerConfig> =
  {
    gameImpressions: {
      handler: sduiGameImpressionsHandler,
      skipItemImpressionsLog: false,
    },
  };
