import { sendEvent } from "@rbx/core-scripts/event-stream";
import type { SduiAnalyticsReporter, SduiEventDescriptor, SduiPageContext } from "@rbx/sdui-core";

export function createCsrAnalyticsReporter(): SduiAnalyticsReporter {
  return {
    reportOmniFeedStats(
      _feedStats: Record<string, string | number>,
      _pageContext?: SduiPageContext,
    ): void {
      // TODO (sdui): wire feed stats event
    },

    logEvent(descriptor: SduiEventDescriptor, fields: Record<string, string | number>): void {
      sendEvent(descriptor, fields);
    },
  };
}
