import { reportImpressionAnalytics } from "../analytics/reportImpressionAnalytics";
import type { SduiImpressionHandlerRegistry } from "../registry/SduiImpressionHandlerRegistry";
import type { CollectionAnalyticsData, ItemAnalyticsData, SduiImpressionContext } from "../types";

export interface ReportImpressionsOptions {
  ctx: SduiImpressionContext;
  registry: SduiImpressionHandlerRegistry;
  impressionIndexes: number[];
  itemAnalyticsDatas: (ItemAnalyticsData | null)[];
  collectionAnalyticsData: CollectionAnalyticsData | undefined;
  startRowNumber?: number;
  /** Proto `impression_event_name`. Looked up in `registry`. */
  impressionEventName?: string;
  /** When defined, wins over handler config; otherwise falls back to handler
   * config, then default-on. */
  skipItemImpressionsLog?: boolean;
}

/**
 * Sends unified logging impression events for a collection.
 *
 * Flow (lua `reportUnifiedLoggingImpressions` parity):
 *   1. If `impressionEventName` + handler registered → handler owns the custom event.
 *      `skipItemImpressionsLog` controls whether generic `itemImpressions` also fires.
 *   2. If `impressionEventName` + no handler → fire the custom event with that name.
 *      `skipItemImpressionsLog` controls whether generic `itemImpressions` also fires.
 *   3. No `impressionEventName` → just fires generic `itemImpressions`.
 */
export function reportImpressions(options: ReportImpressionsOptions): void {
  const {
    ctx,
    registry,
    impressionIndexes,
    itemAnalyticsDatas,
    collectionAnalyticsData,
    startRowNumber,
    impressionEventName,
    skipItemImpressionsLog,
  } = options;

  const handlerConfig = impressionEventName
    ? registry.getImpressionHandler(impressionEventName)
    : undefined;

  if (handlerConfig) {
    handlerConfig.handler(
      ctx,
      impressionIndexes,
      itemAnalyticsDatas,
      collectionAnalyticsData,
      startRowNumber,
    );
  } else if (impressionEventName != null) {
    // Unregistered override: fire default payload under the custom name (Lua parity).
    reportImpressionAnalytics({
      impressionIndexes,
      itemAnalyticsDatas,
      collectionAnalyticsData,
      pageContext: ctx.pageContext,
      analyticsReporter: ctx.analyticsReporter,
      errorReporter: ctx.errorReporter,
      eventNameOverride: impressionEventName,
    });
  }

  if (skipItemImpressionsLog === true) return;
  if (skipItemImpressionsLog === undefined && handlerConfig?.skipItemImpressionsLog) return;

  reportImpressionAnalytics({
    impressionIndexes,
    itemAnalyticsDatas,
    collectionAnalyticsData,
    pageContext: ctx.pageContext,
    analyticsReporter: ctx.analyticsReporter,
    errorReporter: ctx.errorReporter,
  });
}
