import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type {
  AnalyticsContext,
  AnalyticsFieldMap,
  CollectionAnalyticsData,
  ItemAnalyticsData,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";
import { parseAnalyticsField, readMergedAnalyticsFields } from "../utils/analyticsParsing";

/** Sentinel values used when validation fails or a field is missing from the template. */
export const DUMMY_ITEM_DATA: ItemAnalyticsData = {
  id: "Unknown",
  itemPosition: -1,
  itemComponentType: "Unknown",
};

export const DUMMY_COLLECTION_DATA: CollectionAnalyticsData = {
  collectionId: -1,
  contentType: "Unknown",
  itemsPerRow: -1,
  collectionPosition: -1,
  totalNumberOfItems: -1,
  collectionComponentType: "Unknown",
  isWideTiles: false,
};

const UNSET_COLLECTION_POSITION = -1;

function parseCollectionId(input: AnalyticsFieldMap[string] | undefined): string | number {
  if (typeof input === "string") {
    if (input.trim() === "") {
      return input;
    }
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : input;
  }
  return typeof input === "number" ? input : DUMMY_COLLECTION_DATA.collectionId;
}

export function isValidCollectionAnalyticsData(data: CollectionAnalyticsData): boolean {
  const hasValidCollectionId =
    typeof data.collectionId === "string"
      ? data.collectionId.trim() !== ""
      : data.collectionId >= 0;
  return hasValidCollectionId && data.collectionPosition >= 0 && data.totalNumberOfItems >= 0;
}

export function isValidItemAnalyticsData(data: ItemAnalyticsData): boolean {
  return data.id !== DUMMY_ITEM_DATA.id && data.itemPosition >= 0;
}

export interface BuildCollectionAnalyticsDataOptions {
  itemsPerRow: number;
  totalNumberOfItems: number;
  collectionComponentType: string;
  isWideTiles?: boolean;
}

/**
 * Builds collection-level analytics from merged template snapshots plus
 * layout/runtime fields supplied by the collection component.
 */
export function buildCollectionAnalyticsData(
  analyticsContext: AnalyticsContext | undefined,
  options: BuildCollectionAnalyticsDataOptions,
  pageContext?: SduiPageContext,
  errorReporter?: SduiErrorReporter,
): CollectionAnalyticsData {
  const mergedFields = readMergedAnalyticsFields(analyticsContext);
  const { itemsPerRow, totalNumberOfItems, collectionComponentType, isWideTiles } = options;

  const collectionData: CollectionAnalyticsData = {
    ...mergedFields,
    collectionId: parseCollectionId(mergedFields.collectionId),
    collectionPosition: parseAnalyticsField(
      mergedFields.collectionPosition,
      UNSET_COLLECTION_POSITION,
    ),
    contentType: parseAnalyticsField(mergedFields.contentType, DUMMY_COLLECTION_DATA.contentType),
    itemsPerRow,
    totalNumberOfItems,
    collectionComponentType:
      collectionComponentType ||
      parseAnalyticsField(
        mergedFields.collectionComponentType,
        DUMMY_COLLECTION_DATA.collectionComponentType,
      ),
    isWideTiles: isWideTiles ?? false,
  };

  const isLayoutPending = itemsPerRow < 0;
  if (!isValidCollectionAnalyticsData(collectionData) && !isLayoutPending) {
    reportError(
      SduiErrorName.InvalidCollectionAnalyticsData,
      `Collection analytics data for component type ${collectionComponentType} is invalid: ${JSON.stringify(collectionData)}`,
      pageContext,
      { componentType: collectionComponentType },
      errorReporter,
    );
    return {
      ...DUMMY_COLLECTION_DATA,
      ...collectionData,
    };
  }

  return collectionData;
}

/**
 * Builds per-item analytics for impressions. Requires template `id`;
 * uses an explicit canonical position when supplied, otherwise context data
 * followed by the one-based local list index.
 */
export function buildItemAnalyticsData(
  childAnalyticsContext: AnalyticsContext | undefined,
  itemIndex: number,
  pageContext?: SduiPageContext,
  errorReporter?: SduiErrorReporter,
  itemPositionOverride?: number,
): ItemAnalyticsData | null {
  if (!childAnalyticsContext) {
    return null;
  }

  const mergedFields = readMergedAnalyticsFields(childAnalyticsContext);
  const defaultItemPosition = itemIndex + 1;

  const itemData: ItemAnalyticsData = {
    ...mergedFields,
    id: parseAnalyticsField(mergedFields.id, DUMMY_ITEM_DATA.id),
    itemPosition:
      itemPositionOverride ?? parseAnalyticsField(mergedFields.itemPosition, defaultItemPosition),
    itemComponentType: parseAnalyticsField(
      mergedFields.itemComponentType,
      DUMMY_ITEM_DATA.itemComponentType,
    ),
  };

  if (!isValidItemAnalyticsData(itemData)) {
    reportError(
      SduiErrorName.InvalidItemAnalyticsData,
      `Item analytics data is invalid: ${JSON.stringify(itemData)}`,
      pageContext,
      undefined,
      errorReporter,
    );
    return null;
  }

  return itemData;
}
