import { SduiErrorName, type SduiImpressionHandlerConfig } from "@rbx/sdui-core";

import eventStreamConstants from "../../../common/constants/eventStreamConstants";
import { buildFilterImpressionParams } from "../utils/filterImpressionsParamsUtils";

/**
 * V2 impression handler for filter impressions.
 * Mirrors lua `SduiFilterImpressionsHandler` using the legacy event-stream payload.
 */
export const sduiFilterImpressionsHandler: SduiImpressionHandlerConfig["handler"] = (
  ctx,
  impressionIndexes,
  itemAnalyticsDatas,
  collectionAnalyticsData,
) => {
  if (!collectionAnalyticsData) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.LogImpressionsMissingCollectionData,
      "Missing collectionAnalyticsData for filter impressions",
      ctx.pageContext,
    );
    return;
  }

  if (impressionIndexes.length === 0) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.ReportItemImpressionsNoIndexesToSend,
      "No indexes to send for filter impressions",
      ctx.pageContext,
    );
    return;
  }

  const hasValidItemData = impressionIndexes.some(index => itemAnalyticsDatas[index] != null);
  if (!hasValidItemData) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.ReportItemImpressionsMissingData,
      "No valid item analytics data for filter impressions",
      ctx.pageContext,
    );
    return;
  }

  if (!ctx.analyticsReporter) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.ReportItemImpressionsMissingAnalyticsReporter,
      "Missing analyticsReporter for filter impressions",
      ctx.pageContext,
    );
    return;
  }

  const filterImpressionParams = buildFilterImpressionParams({
    impressionIndexes,
    itemAnalyticsDatas,
    collectionAnalyticsData,
    pageContext: ctx.pageContext,
  });

  const [descriptor, fields] = eventStreamConstants.filterImpressions(filterImpressionParams);
  ctx.analyticsReporter.logEvent(descriptor, fields);
};
