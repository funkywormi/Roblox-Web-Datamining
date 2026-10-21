import {
  EventNames,
  ItemImpressionsMetadata,
  SharedEventMetadata,
  parseEventParams,
} from "@rbx/unified-logging";
import { reportError, SduiErrorName } from "../errors";
import type {
  CollectionAnalyticsData,
  ItemAnalyticsData,
  SduiAnalyticsReporter,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";

type EventParamValue =
  | number
  | string
  | boolean
  | object
  | (number | string | boolean)[]
  | undefined;

export interface ReportImpressionAnalyticsOptions {
  impressionIndexes: number[];
  itemAnalyticsDatas: (ItemAnalyticsData | null)[];
  collectionAnalyticsData: CollectionAnalyticsData | undefined;
  pageContext?: SduiPageContext;
  analyticsReporter?: SduiAnalyticsReporter;
  errorReporter?: SduiErrorReporter;
  /**
   * Fires the default-shape payload under a non-default event name. Used by
   * `reportImpressions` on the handler-miss path (lua parity).
   */
  eventNameOverride?: string;
  /**
   * Physical 0-based grid cells, aligned with `itemAnalyticsDatas`. Row numbers
   * use these when a pooled item's canonical rank differs from its cell.
   */
  itemCellIndexes?: readonly number[];
}

/**
 * Sends the generic `itemImpressions` analytics event with collection-shape
 * params (collection metadata + per-item ids, positions, row numbers). Reports
 * structured errors and no-ops the send when required inputs are missing.
 */
export function reportImpressionAnalytics(options: ReportImpressionAnalyticsOptions): void {
  const {
    impressionIndexes,
    itemAnalyticsDatas,
    collectionAnalyticsData,
    pageContext,
    analyticsReporter,
    errorReporter,
    eventNameOverride,
    itemCellIndexes,
  } = options;

  if (impressionIndexes.length === 0) {
    reportError(
      SduiErrorName.ReportItemImpressionsNoIndexesToSend,
      "No indexes to send for impressions",
      pageContext,
      undefined,
      errorReporter,
    );
    return;
  }

  if (!collectionAnalyticsData) {
    reportError(
      SduiErrorName.LogImpressionsMissingCollectionData,
      "Missing collection data for impressions",
      pageContext,
      undefined,
      errorReporter,
    );
    return;
  }

  const impressedItems = impressionIndexes.flatMap(index => {
    const item = itemAnalyticsDatas[index];
    return item == null ? [] : [{ index, item }];
  });

  if (impressedItems.length === 0) {
    reportError(
      SduiErrorName.ReportItemImpressionsMissingData,
      "No valid item analytics data for impressions",
      pageContext,
      undefined,
      errorReporter,
    );
    return;
  }

  if (!analyticsReporter) return;

  const itemsPerRow = collectionAnalyticsData.itemsPerRow || 1;
  const itemIds = impressedItems.map(({ item }) => item.id);
  const itemPositions = impressedItems.map(({ item }) => item.itemPosition);
  // itemPosition is the 1-based canonical rank. Cell indexes are 0-based, so
  // a deferred pool item (rank 8 in cell 0) must not inherit the rank's row.
  const rowNumbers = impressedItems.map(({ index, item }) => {
    const cellIndex = itemCellIndexes?.[index];
    const layoutPosition = cellIndex === undefined ? item.itemPosition : cellIndex + 1;
    return Math.ceil(layoutPosition / itemsPerRow);
  });
  const context = pageContext?.appPage ?? "unknown";

  const params: Record<string, EventParamValue> = {
    ...collectionAnalyticsData,
    [SharedEventMetadata.CollectionId]: collectionAnalyticsData.collectionId,
    [SharedEventMetadata.CollectionPosition]: collectionAnalyticsData.collectionPosition,
    [SharedEventMetadata.ContentType]: collectionAnalyticsData.contentType,
    [SharedEventMetadata.CollectionComponentType]: collectionAnalyticsData.collectionComponentType,
    [SharedEventMetadata.Context]: context,
    [ItemImpressionsMetadata.TotalNumberOfItems]: collectionAnalyticsData.totalNumberOfItems,
    [ItemImpressionsMetadata.ItemIds]: itemIds,
    [ItemImpressionsMetadata.ItemPositions]: itemPositions,
    [ItemImpressionsMetadata.RowNumbers]: rowNumbers,
    [ItemImpressionsMetadata.PositionsInTopic]: itemPositions,
  };

  const eventName = eventNameOverride ?? EventNames.ItemImpressions;
  analyticsReporter.logEvent(
    { name: eventName, type: eventName, context },
    parseEventParams(params),
  );
}
