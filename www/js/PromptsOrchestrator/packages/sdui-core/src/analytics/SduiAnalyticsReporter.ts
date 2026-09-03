import { SduiAnalyticsReporter } from "../types/analytics";

export const noOpAnalyticsReporter: SduiAnalyticsReporter = {
  reportOmniFeedStats(feedStats, pageContext) {
    // eslint-disable-next-line no-console
    console.log("[noOpAnalyticsReporter] reportOmniFeedStats", { feedStats, pageContext });
  },
  logEvent(descriptor, fields) {
    // eslint-disable-next-line no-console
    console.log("[noOpAnalyticsReporter] logEvent", { descriptor, fields });
  },
};
