import { isOneOf } from "../utils/oneOfHelper";
import {
  isRecord,
  isUnknownArray,
  nonNegativeIntegerOr,
  positiveIntegerOr,
} from "../utils/typeGuards";
import { DEFAULT_COLLECTION_ITEM_SIZE, parseCollectionItemSize } from "./collectionItemSize";
import { isPoolId } from "./poolIdentifiers";
import { PoolItemAlignment } from "./poolItemAlignment";
import type { ItemLayout, NormalizedPool, PoolId, PoolItem } from "./types";

export type NormalizePoolIssue =
  | {
      readonly reason: "unsupportedItemKind";
      readonly poolId: PoolId;
      readonly poolIndex: number;
      readonly itemKind?: string;
    }
  | {
      readonly reason: "malformedPool";
      readonly poolId?: PoolId;
    };

function normalizeItemLayout(value: unknown): ItemLayout {
  const layout = isRecord(value) ? value : undefined;
  const alignmentType =
    layout?.alignmentType === PoolItemAlignment.LeftPin ||
    layout?.alignmentType === PoolItemAlignment.RightPin
      ? layout.alignmentType
      : undefined;

  return {
    colSpan: positiveIntegerOr(layout?.colSpan, 1),
    rowSpan: positiveIntegerOr(layout?.rowSpan, 1),
    alignmentType,
    minRowPadding: nonNegativeIntegerOr(layout?.minRowPadding, 0),
  };
}

function isNonTrivialLayout(layout: ItemLayout): boolean {
  return (
    layout.colSpan !== 1 ||
    layout.rowSpan !== 1 ||
    layout.alignmentType !== undefined ||
    layout.minRowPadding !== 0
  );
}

function normalizePoolItem(value: unknown): PoolItem | undefined {
  if (!isRecord(value) || !isOneOf(value.kind) || !isRecord(value.kind.value)) return undefined;
  return value.kind.value;
}

export function normalizePools(
  resolvedPools: unknown,
  onIssue?: (issue: NormalizePoolIssue) => void,
): ReadonlyMap<PoolId, NormalizedPool> {
  const normalizedPoolsById = new Map<PoolId, NormalizedPool>();
  if (!isRecord(resolvedPools)) {
    onIssue?.({ reason: "malformedPool" });
    return normalizedPoolsById;
  }

  for (const [rawPoolId, rawPoolData] of Object.entries(resolvedPools)) {
    const poolId = isPoolId(rawPoolId) ? rawPoolId : undefined;
    if (!poolId || !isRecord(rawPoolData) || !isUnknownArray(rawPoolData.items)) {
      onIssue?.({
        reason: "malformedPool",
        ...(poolId ? { poolId } : {}),
      });
      continue;
    }

    const items: (PoolItem | undefined)[] = [];
    const nonTrivialLayoutsByPoolIndex = new Map<number, ItemLayout>();
    for (let poolIndex = 0; poolIndex < rawPoolData.items.length; poolIndex += 1) {
      const rawPoolItem = rawPoolData.items[poolIndex];
      const normalizedPoolItem = normalizePoolItem(rawPoolItem);
      // Item needs to be pushed even before verifying because the source
      // indexes need to be preserved
      items.push(normalizedPoolItem);
      if (!isRecord(rawPoolItem) || !normalizedPoolItem) {
        const rawItemKind = isRecord(rawPoolItem) ? rawPoolItem.kind : undefined;
        const unsupportedItemKind =
          isOneOf(rawItemKind) && typeof rawItemKind.kind === "string"
            ? rawItemKind.kind
            : undefined;
        onIssue?.({
          reason: "unsupportedItemKind",
          poolId,
          poolIndex,
          itemKind: unsupportedItemKind,
        });
        continue;
      }

      const normalizedLayout = normalizeItemLayout(rawPoolItem.layout);
      if (isNonTrivialLayout(normalizedLayout)) {
        nonTrivialLayoutsByPoolIndex.set(poolIndex, normalizedLayout);
      }
    }

    normalizedPoolsById.set(poolId, {
      items,
      layouts: nonTrivialLayoutsByPoolIndex.size > 0 ? nonTrivialLayoutsByPoolIndex : undefined,
      // Preserve omission so the template can supply the default through
      // poolConfig.entries[poolId].collectionItemSize. An explicitly invalid
      // pool value falls back to Medium instead.
      collectionItemSize:
        rawPoolData.collectionItemSize === undefined
          ? undefined
          : (parseCollectionItemSize(rawPoolData.collectionItemSize) ??
            DEFAULT_COLLECTION_ITEM_SIZE),
    });
  }

  return normalizedPoolsById;
}
