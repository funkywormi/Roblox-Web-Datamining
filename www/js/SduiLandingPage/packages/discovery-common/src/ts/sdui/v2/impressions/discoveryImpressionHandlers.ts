import type { SduiImpressionHandlerConfig } from "@rbx/sdui-core";
import { sduiFilterImpressionsHandler } from "./sduiFilterImpressionsHandler";
import { sduiGameImpressionsHandler } from "./sduiGameImpressionsHandler";

export const DISCOVERY_IMPRESSION_HANDLERS: Record<string, SduiImpressionHandlerConfig> = {
  filterImpressions: {
    handler: sduiFilterImpressionsHandler,
    skipItemImpressionsLog: true,
  },
  gameImpressions: {
    handler: sduiGameImpressionsHandler,
    skipItemImpressionsLog: true,
  },
};
