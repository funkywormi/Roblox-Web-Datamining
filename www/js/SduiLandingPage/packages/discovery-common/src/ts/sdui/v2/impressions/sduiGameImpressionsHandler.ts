import {
  SduiErrorName,
  type CollectionAnalyticsData,
  type SduiImpressionHandlerConfig,
} from "@rbx/sdui-core";

import eventStreamConstants from "../../../common/constants/eventStreamConstants";
import { buildGameImpressionParams } from "../../utils/gameImpressionsParamsUtils";
import { toV1PageContext } from "../utils/pageReferralUtils";

const DEFAULT_ITEM_COMPONENT_TYPE = "Unknown";

const getUseGridTiles = (collectionAnalyticsData: CollectionAnalyticsData): boolean =>
  collectionAnalyticsData.isWideTiles === true;

/**
 * V2 impression handler for proto `impression_event_name = "gameImpressions"`.
 * Mirrors V1 `sendGameImpressionsFromSdui` using the legacy event-stream payload.
 */
export const sduiGameImpressionsHandler: SduiImpressionHandlerConfig["handler"] = (
  ctx,
  impressionIndexes,
  itemAnalyticsDatas,
  collectionAnalyticsData,
) => {
  if (!collectionAnalyticsData) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.LogImpressionsMissingCollectionData,
      "Missing collectionAnalyticsData for game impressions",
      ctx.pageContext,
    );
    return;
  }

  if (impressionIndexes.length === 0) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.ReportItemImpressionsNoIndexesToSend,
      "No indexes to send for game impressions",
      ctx.pageContext,
    );
    return;
  }

  const hasValidItemData = impressionIndexes.some(index => itemAnalyticsDatas[index] != null);
  if (!hasValidItemData) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.ReportItemImpressionsMissingData,
      "No valid item analytics data for game impressions",
      ctx.pageContext,
    );
    return;
  }

  if (!ctx.analyticsReporter) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.ReportItemImpressionsMissingAnalyticsReporter,
      "Missing analyticsReporter for game impressions",
      ctx.pageContext,
    );
    return;
  }

  const useGridTiles = getUseGridTiles(collectionAnalyticsData);

  const gameImpressionParams = buildGameImpressionParams({
    impressionIndexes,
    itemAnalyticsDatas,
    collectionAnalyticsData,
    pageContext: toV1PageContext(ctx.pageContext),
    useGridTiles,
    componentTypeFallback: DEFAULT_ITEM_COMPONENT_TYPE,
  });

  const [descriptor, fields] = eventStreamConstants.gameImpressions(gameImpressionParams);
  ctx.analyticsReporter.logEvent(descriptor, fields);
};
