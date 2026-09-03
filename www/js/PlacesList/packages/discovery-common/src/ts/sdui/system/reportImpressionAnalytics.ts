import {
  EventNames,
  ItemImpressionsMetadata,
  parseEventParams,
  SharedEventMetadata,
} from "@rbx/unified-logging";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import {
  TAnalyticsData,
  TCollectionAnalyticsData,
  TItemAnalyticsData,
  TSduiContext,
} from "./SduiTypes";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import { getEventContext } from "../utils/analyticsParsingUtils";

export const buildBaseImpressionsParams = (
  indexesToSend: number[],
  itemAnalyticsDatas: (TItemAnalyticsData | null)[],
  contentType: string,
  itemsPerRow: number,
  collectionPosition: number,
  collectionId: number,
  collectionComponentType: string,
  totalNumberOfItems: number,
  sduiContext: TSduiContext,
): TAnalyticsData => {
  const itemIds: string[] = [];
  const itemPositions: number[] = [];
  const rowNumbers: number[] = [];
  const positionsInTopic: number[] = [];

  indexesToSend.forEach(indexToSend => {
    const item = itemAnalyticsDatas[indexToSend];
    if (item === undefined || item === null) {
      logSduiError(
        SduiErrorNames.BuildBaseImpressionParamsMissingItem,
        `Item at index ${indexToSend} is nil when sending impressions for collection ${collectionId}`,
        sduiContext.pageContext,
      );
      return;
    }

    itemIds.push(item.id);

    itemPositions.push(item.itemPosition);
    positionsInTopic.push(item.itemPosition);

    if (itemsPerRow !== undefined && itemsPerRow > 0) {
      const rowInSort = Math.floor(indexToSend / itemsPerRow);

      // incremented to match app
      rowNumbers.push(rowInSort + 1);
    } else {
      logSduiError(
        SduiErrorNames.BuildBaseImpressionParamsInvalidItemsPerRow,
        `itemsPerRow is undefined or not greater than 0 when sending impressions for collection ${collectionId}: ${JSON.stringify(
          itemsPerRow,
        )}`,
        sduiContext.pageContext,
      );

      rowNumbers.push(1);
    }
  });

  return {
    [SharedEventMetadata.CollectionId]: collectionId,
    [SharedEventMetadata.CollectionPosition]: collectionPosition,
    [SharedEventMetadata.ContentType]: contentType,
    [SharedEventMetadata.CollectionComponentType]: collectionComponentType,
    [ItemImpressionsMetadata.TotalNumberOfItems]: totalNumberOfItems,
    [ItemImpressionsMetadata.ItemIds]: itemIds.join(","),
    [ItemImpressionsMetadata.ItemPositions]: itemPositions.join(","),
    [ItemImpressionsMetadata.RowNumbers]: rowNumbers.join(","),
    [ItemImpressionsMetadata.PositionsInTopic]: positionsInTopic.join(","),
  };
};

// These fields are included in the base params, so ignored when building the CSV
const CSV_IGNORE_KEYS = [
  SharedEventMetadata.CollectionId,
  SharedEventMetadata.CollectionPosition,
  SharedEventMetadata.ContentType,
  SharedEventMetadata.CollectionComponentType,
  "id",
  "itemPosition",
  "itemsPerRow",
  "rowNumber",
  ItemImpressionsMetadata.TotalNumberOfItems,
];

export const buildCsvFieldsFromItemData = (
  indexesToSend: number[],
  itemAnalyticsDatas: (TItemAnalyticsData | null)[],
  collectionId: number,
  sduiContext: TSduiContext,
): TAnalyticsData => {
  const fields: Record<string, string[]> = {};

  indexesToSend.forEach((indexToSend, index) => {
    const item = itemAnalyticsDatas[indexToSend];

    if (item === undefined || item === null) {
      logSduiError(
        SduiErrorNames.BuildItemImpressionParamsMissingItem,
        `Item at index ${indexToSend} is nil when sending impressions for collection ${collectionId}`,
        sduiContext.pageContext,
      );
      return;
    }

    Object.entries(item).forEach(([key, value]) => {
      if (!CSV_IGNORE_KEYS.includes(key) && value !== undefined && value !== null) {
        if (!fields[key]) {
          // Initialize the array with an empty string at each index
          fields[key] = indexesToSend.map(() => "");
        }

        // Set value at index in the indexesToSend array
        fields[key][index] = value.toString();
      }
    });
  });

  const csvFields: Record<string, string> = {};

  Object.entries(fields).forEach(([key, values]) => {
    csvFields[`${key}_arr`] = values.join(",");
  });

  return csvFields;
};

export const reportImpressionAnalytics = (
  indexesToSend: number[],
  itemAnalyticsDatas: (TItemAnalyticsData | null)[],
  collectionAnalyticsData: TCollectionAnalyticsData | null,
  sduiContext: TSduiContext,
): void => {
  if (!collectionAnalyticsData || !itemAnalyticsDatas) {
    logSduiError(
      SduiErrorNames.ReportItemImpressionsMissingData,
      `Missing collection ${JSON.stringify(collectionAnalyticsData)} or item ${JSON.stringify(
        itemAnalyticsDatas,
      )} data when sending impressions for collection ${
        collectionAnalyticsData?.collectionId ?? "undefined"
      }`,
      sduiContext.pageContext,
    );
    return;
  }

  if (indexesToSend.length === 0) {
    logSduiError(
      SduiErrorNames.ReportItemImpressionsNoIndexesToSend,
      `No indexes to send for collection ${collectionAnalyticsData.collectionId}`,
      sduiContext.pageContext,
    );
    return;
  }

  const baseParams = buildBaseImpressionsParams(
    indexesToSend,
    itemAnalyticsDatas,
    collectionAnalyticsData.contentType,
    collectionAnalyticsData.itemsPerRow,
    collectionAnalyticsData.collectionPosition,
    collectionAnalyticsData.collectionId,
    collectionAnalyticsData.collectionComponentType,
    collectionAnalyticsData.totalNumberOfItems,
    sduiContext,
  );

  const itemFields = buildCsvFieldsFromItemData(
    indexesToSend,
    itemAnalyticsDatas,
    collectionAnalyticsData.collectionId,
    sduiContext,
  );

  const params = {
    ...collectionAnalyticsData,
    ...itemFields,
    ...baseParams,
  };

  sendEvent(
    {
      name: EventNames.ItemImpressions,
      type: EventNames.ItemImpressions,
      context: getEventContext(sduiContext.pageContext) ?? "unknown",
    },
    parseEventParams({ ...params }),
  );
};

export default reportImpressionAnalytics;
