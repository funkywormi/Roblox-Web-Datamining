import { signal } from "@preact/signals-core";
import {
  DEFAULT_COLLECTION_ITEM_SIZE,
  parseCollectionItemSize,
  type CollectionItemSize,
} from "./collectionItemSize";
import type { CollectionLayoutSource } from "./types";

interface CollectionLayoutConfig {
  // this is width of the item/tile
  minItemWidth: number;
  minimumColumnsPerRow: number;
  maximumColumnsPerRow: number;
}

// Note: duplicating here so we don't keep adding additional dependencies on the discovery package
// https://github.rbx.com/Roblox/discovery-sdui-core/blob/9b1510d99aa254d339fba7d5abb6f633b9d1a69c/packages/@rbx/discovery-sdui-components/src/common/constants/collectionCarouselLayoutConfig.ts
const COLLECTION_LAYOUT_CONFIG: Record<CollectionItemSize, CollectionLayoutConfig> = {
  XSmall: {
    minItemWidth: 80,
    minimumColumnsPerRow: 3,
    maximumColumnsPerRow: 20,
  },
  Small: {
    minItemWidth: 150,
    minimumColumnsPerRow: 3,
    maximumColumnsPerRow: 12,
  },
  Medium: {
    minItemWidth: 233,
    minimumColumnsPerRow: 2,
    maximumColumnsPerRow: 6,
  },
  Large: {
    minItemWidth: 300,
    minimumColumnsPerRow: 1,
    maximumColumnsPerRow: 4,
  },
  XLarge: {
    minItemWidth: 300,
    minimumColumnsPerRow: 1,
    maximumColumnsPerRow: 1,
  },
};

// https://github.rbx.com/Roblox/discovery-sdui-core/blob/9b1510d99aa254d339fba7d5abb6f633b9d1a69c/packages/%40rbx/discovery-sdui-components/src/common/hooks/useCollectionLayoutParams.ts
export function resolveCollectionColumnGap(containerWidth: number | undefined): number {
  if (!containerWidth) return 18;
  if (containerWidth < 1024) return 12;
  if (containerWidth < 1280) return 18;
  return 24;
}

export function resolveCollectionColumnCount(
  collectionItemSize: string | undefined,
  containerWidth: number | undefined,
): number {
  const resolvedSize = parseCollectionItemSize(collectionItemSize) ?? DEFAULT_COLLECTION_ITEM_SIZE;
  const { minItemWidth, minimumColumnsPerRow, maximumColumnsPerRow } =
    COLLECTION_LAYOUT_CONFIG[resolvedSize];

  if (!containerWidth) return minimumColumnsPerRow;

  const columnGap = resolveCollectionColumnGap(containerWidth);
  /**
   * [tile] gap [tile] gap [tile]
   * 150    12   150   12   150
   * The last tile doesn't have a gap so we need to add it back to the container width
   */
  const desiredColumns = Math.floor((containerWidth + columnGap) / (minItemWidth + columnGap));
  return Math.min(Math.max(minimumColumnsPerRow, desiredColumns), maximumColumnsPerRow);
}

export function createCollectionLayoutSource(
  responsive: {
    screenWidth: number | undefined;
  },
  fallbackSource?: CollectionLayoutSource,
): CollectionLayoutSource {
  const containerWidth = signal<number | undefined>(responsive.screenWidth);

  return {
    setContainerWidth(width) {
      containerWidth.value = width;
    },
    resolveColumnCount(collectionItemSize) {
      const currentContainerWidth = containerWidth.value;
      if (!currentContainerWidth && fallbackSource) {
        return fallbackSource.resolveColumnCount(collectionItemSize);
      }
      return resolveCollectionColumnCount(collectionItemSize, currentContainerWidth);
    },
  };
}
