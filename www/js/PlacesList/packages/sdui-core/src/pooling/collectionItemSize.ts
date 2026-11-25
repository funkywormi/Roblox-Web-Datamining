export const COLLECTION_ITEM_SIZES = ["XSmall", "Small", "Medium", "Large", "XLarge"] as const;

export type CollectionItemSize = (typeof COLLECTION_ITEM_SIZES)[number];

export const DEFAULT_COLLECTION_ITEM_SIZE: CollectionItemSize = "Medium";

export function parseCollectionItemSize(value: unknown): CollectionItemSize | undefined {
  switch (value) {
    case "XSmall":
    case "Small":
    case "Medium":
    case "Large":
    case "XLarge":
      return value;
    default:
      return undefined;
  }
}
