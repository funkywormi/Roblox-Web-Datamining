import {
  EventNames,
  ItemImpressionsMetadata,
  SharedEventMetadata,
  parseEventParams,
} from "@rbx/unified-logging";
import { generateRandomUuid } from "@rbx/core-lib/uuid";
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

// Keys already emitted as top-level collection or parallel-array base fields
// (matches Lua UnifiedLogging/buildItemMetadataFields.lua IGNORE_KEYS, plus
// Web's `feedItemPosition` injected by SduiRenderer's addListItemAnalytics).
const ITEM_METADATA_IGNORE_KEYS: ReadonlySet<string> = new Set([
  "collectionId",
  "collectionPosition",
  "contentType",
  "id",
  "itemPosition",
  "itemsPerRow",
  "rowNumber",
  "totalNumberOfItems",
  "feedItemPosition",
]);

/**
 * Aggregates item-level analytics metadata into comma-separated `{key}_arr`
 * fields aligned with `impressedItems` (Lua `buildItemMetadataFields` parity).
 * Items missing a key present on another impressed item receive an empty slot.
 */
function buildItemMetadataFields(
  impressedItems: readonly ItemAnalyticsData[],
): Record<string, string> {
  const columns = new Map<string, string[]>();

  impressedItems.forEach((item, i) => {
    for (const [key, value] of Object.entries(item)) {
      if (
        ITEM_METADATA_IGNORE_KEYS.has(key) ||
        (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean")
      ) {
        continue;
      }
      let column = columns.get(key);
      if (!column) {
        column = new Array<string>(impressedItems.length).fill("");
        columns.set(key, column);
      }
      column[i] = String(value);
    }
  });

  const result: Record<string, string> = {};
  for (const [key, values] of columns) {
    result[`${key}_arr`] = values.join(",");
  }
  return result;
}

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
   * 1-based starting row of this collection in the feed. When supplied, emits
   * `feedRowNumbers` and `positionsInRow` (Lua `SendItemImpressions` parity).
   */
  startRowNumber?: number;
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
    startRowNumber,
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

  const itemsPerRow =
    collectionAnalyticsData.itemsPerRow > 0 ? collectionAnalyticsData.itemsPerRow : 1;
  const resolvedStartRowNumber =
    startRowNumber ??
    (typeof collectionAnalyticsData.startRowNumber === "number"
      ? collectionAnalyticsData.startRowNumber
      : undefined);
  const itemIds = impressedItems.map(({ item }) => item.id);
  const itemPositions = impressedItems.map(({ item }) => item.itemPosition);
  // itemPosition is the 1-based canonical rank. Cell indexes are 0-based, so
  // a deferred pool item (rank 8 in cell 0) must not inherit the rank's row.
  const layoutPositions = impressedItems.map(({ index, item }) => {
    const cellIndex = itemCellIndexes?.[index];
    return cellIndex === undefined ? item.itemPosition : cellIndex + 1;
  });
  const rowNumbers = layoutPositions.map(layoutPosition => Math.ceil(layoutPosition / itemsPerRow));
  const feedRowNumbers =
    resolvedStartRowNumber !== undefined
      ? rowNumbers.map(rowInSort => resolvedStartRowNumber + rowInSort - 1)
      : undefined;
  const positionsInRow =
    resolvedStartRowNumber !== undefined
      ? layoutPositions.map(layoutPosition => ((layoutPosition - 1) % itemsPerRow) + 1)
      : undefined;
  const context = pageContext?.appPage ?? "unknown";
  const itemMetadataFields = buildItemMetadataFields(impressedItems.map(({ item }) => item));

  const params: Record<string, EventParamValue> = {
    ...collectionAnalyticsData,
    ...itemMetadataFields,
    [SharedEventMetadata.CollectionId]: collectionAnalyticsData.collectionId,
    [SharedEventMetadata.CollectionPosition]: collectionAnalyticsData.collectionPosition,
    [SharedEventMetadata.ContentType]: collectionAnalyticsData.contentType,
    [SharedEventMetadata.CollectionComponentType]: collectionAnalyticsData.collectionComponentType,
    [SharedEventMetadata.Context]: context,
    [ItemImpressionsMetadata.TotalNumberOfItems]: collectionAnalyticsData.totalNumberOfItems,
    [ItemImpressionsMetadata.ItemIds]: itemIds,
    [ItemImpressionsMetadata.ItemPositions]: itemPositions,
    [ItemImpressionsMetadata.RowNumbers]: rowNumbers,
    ...(feedRowNumbers !== undefined
      ? { [ItemImpressionsMetadata.FeedRowNumbers]: feedRowNumbers }
      : {}),
    ...(positionsInRow !== undefined
      ? { [ItemImpressionsMetadata.PositionsInRow]: positionsInRow }
      : {}),
    [ItemImpressionsMetadata.PositionsInTopic]: itemPositions,
    // Preserve a caller-provided interactionUuid, otherwise generate a new one per event
    [SharedEventMetadata.InteractionUuid]:
      typeof collectionAnalyticsData[SharedEventMetadata.InteractionUuid] === "string"
        ? collectionAnalyticsData[SharedEventMetadata.InteractionUuid]
        : generateRandomUuid(),
  };

  const eventName = eventNameOverride ?? EventNames.ItemImpressions;
  analyticsReporter.logEvent(
    { name: eventName, type: eventName, context },
    parseEventParams(params),
  );
}
