import { sendEvent } from "@rbx/core-scripts/event-stream";
import type {
  AnalyticsFieldMap,
  SduiAnalyticsReporter,
  SduiEventDescriptor,
  SduiPageContext,
} from "@rbx/sdui-core";

export function createCsrAnalyticsReporter(): SduiAnalyticsReporter {
  return {
    reportOmniFeedStats(
      _feedStats: Record<string, string | number>,
      _pageContext?: SduiPageContext,
    ): void {
      // TODO (sdui): wire feed stats event
    },

    logEvent(descriptor: SduiEventDescriptor, fields: AnalyticsFieldMap): void {
      sendEvent(descriptor, fields);
    },
  };
}
