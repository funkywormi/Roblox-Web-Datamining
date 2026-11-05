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
    skipItemImpressionsLog: true,
  },
};
