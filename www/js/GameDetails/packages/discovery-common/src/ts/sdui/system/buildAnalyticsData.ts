import { parseMaybeStringNumberField, parseStringField } from "../utils/analyticsParsingUtils";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import {
  TAnalyticsData,
  TCollectionAnalyticsData,
  TItemAnalyticsData,
  TSduiContext,
} from "./SduiTypes";

export const DUMMY_ITEM_DATA: TItemAnalyticsData = {
  id: "Unknown",
  itemPosition: -1,
  itemComponentType: "Unknown",
};

export const DUMMY_COLLECTION_DATA: TCollectionAnalyticsData = {
  collectionId: -1,
  contentType: "Unknown",
  itemsPerRow: -1,
  collectionPosition: -1,
  totalNumberOfItems: -1,
  collectionComponentType: "Unknown",
};

export const isValidCollectionAnalyticsData = (data: TCollectionAnalyticsData): boolean => {
  if (
    data.collectionId === undefined ||
    data.collectionId < 0 ||
    data.contentType === undefined ||
    data.collectionPosition === undefined ||
    data.collectionPosition < 0 ||
    data.totalNumberOfItems === undefined ||
    data.totalNumberOfItems < 0
  ) {
    return false;
  }

  return true;
};

export const buildAndValidateCollectionAnalyticsData = (
  ancestorAnalyticsData: TAnalyticsData,
  analyticsData: TAnalyticsData,
  componentType: string | undefined,
  itemsPerRow: number,
  totalNumberOfItems: number,
  sduiContext: TSduiContext,
): TCollectionAnalyticsData => {
  const collectionAnalyticsData = {
    ...ancestorAnalyticsData,
    ...analyticsData,
  };

  const resultCollectionAnalyticsData = {
    ...collectionAnalyticsData,
    collectionId: parseMaybeStringNumberField(
      collectionAnalyticsData.collectionId,
      DUMMY_COLLECTION_DATA.collectionId,
    ),
    collectionPosition: parseMaybeStringNumberField(collectionAnalyticsData.collectionPosition, -1),
    contentType: parseStringField(
      collectionAnalyticsData.contentType,
      DUMMY_COLLECTION_DATA.contentType,
    ),
    itemsPerRow,
    totalNumberOfItems,
    collectionComponentType: componentType || DUMMY_COLLECTION_DATA.collectionComponentType,
  };

  if (!isValidCollectionAnalyticsData(resultCollectionAnalyticsData)) {
    logSduiError(
      SduiErrorNames.AnalyticsBuilderInvalidCollectionAnalyticsData,
      `Collection analytics data for component type ${
        componentType || DUMMY_COLLECTION_DATA.collectionComponentType
      } is invalid: ${JSON.stringify(resultCollectionAnalyticsData)}`,
      sduiContext.pageContext,
    );

    // Fill in any missing fields with dummy data
    return {
      ...DUMMY_COLLECTION_DATA,
      ...resultCollectionAnalyticsData,
    };
  }

  return resultCollectionAnalyticsData;
};

export const isValidItemAnalyticsData = (data: TItemAnalyticsData): boolean => {
  if (data.id === undefined || data.itemPosition < 0) {
    return false;
  }

  return true;
};

export const buildAndValidateItemAnalyticsData = (
  analyticsData: TAnalyticsData,
  parentAnalyticsData: TAnalyticsData,
  localAnalyticsData: TAnalyticsData | undefined,
  sduiContext: TSduiContext,
): TItemAnalyticsData => {
  const itemAnalyticsData = {
    ...parentAnalyticsData,
    ...analyticsData,
    ...localAnalyticsData,
  };

  const resultItemAnalyticsData: TItemAnalyticsData = {
    ...itemAnalyticsData,
    id: parseStringField(itemAnalyticsData.id, DUMMY_ITEM_DATA.id),
    itemPosition: parseMaybeStringNumberField(
      itemAnalyticsData.itemPosition,
      DUMMY_ITEM_DATA.itemPosition,
    ),
    itemComponentType: parseStringField(
      itemAnalyticsData.itemComponentType,
      DUMMY_ITEM_DATA.itemComponentType,
    ),
  };

  if (!isValidItemAnalyticsData(resultItemAnalyticsData)) {
    logSduiError(
      SduiErrorNames.AnalyticsBuilderInvalidItemAnalyticsData,
      `Item analytics data is invalid: ${JSON.stringify(resultItemAnalyticsData)}`,
      sduiContext.pageContext,
    );

    // Fill in any missing fields with dummy data
    return {
      ...DUMMY_ITEM_DATA,
      ...resultItemAnalyticsData,
    };
  }

  return resultItemAnalyticsData;
};
