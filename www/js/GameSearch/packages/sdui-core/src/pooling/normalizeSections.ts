import { unwrapOneOf } from "../utils/oneOfHelper";
import { isRecord } from "../utils/typeGuards";
import {
  DEFAULT_COLLECTION_ITEM_SIZE,
  parseCollectionItemSize,
  type CollectionItemSize,
} from "./collectionItemSize";
import { isPoolId, isSectionId } from "./poolIdentifiers";
import type { NormalizedPool, PoolId, PoolSectionRegistration, SectionId } from "./types";

export interface PoolSectionInput {
  identifier: unknown;
  item: unknown;
}

export interface NormalizeSectionIssue {
  readonly reason: "invalidRowBudget";
  readonly sectionId: SectionId;
  readonly rowBudget: unknown;
}

function readSectionPayload(item: unknown): Record<string, unknown> | undefined {
  if (!isRecord(item)) return undefined;
  const inputData = unwrapOneOf(item.inputData);
  return inputData && isRecord(inputData.propValue) ? inputData.propValue : undefined;
}

function readTemplateCollectionItemSize(
  templatePoolEntries: unknown,
  poolId: PoolId | undefined,
): CollectionItemSize | undefined {
  if (!poolId || !isRecord(templatePoolEntries)) return undefined;
  const entry = templatePoolEntries[poolId];
  return isRecord(entry) ? parseCollectionItemSize(entry.collectionItemSize) : undefined;
}

function normalizeNumberOfRows(
  value: unknown,
  poolId: PoolId | undefined,
  sectionId: SectionId,
  onIssue?: (issue: NormalizeSectionIssue) => void,
): number {
  if (poolId && value === -1) return -1;
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (value === -1 || (typeof value === "number" && (value < 0 || !Number.isInteger(value)))) {
    onIssue?.({ reason: "invalidRowBudget", sectionId, rowBudget: value });
  }
  return 1;
}

export function normalizeSections(
  entries: readonly PoolSectionInput[],
  pools: ReadonlyMap<PoolId, NormalizedPool>,
  templatePoolEntries?: unknown,
  onIssue?: (issue: NormalizeSectionIssue) => void,
): readonly PoolSectionRegistration[] {
  const sections: PoolSectionRegistration[] = [];

  for (const entry of entries) {
    if (!isSectionId(entry.identifier)) continue;

    const payload = readSectionPayload(entry.item);
    const poolId = isPoolId(payload?.poolId) ? payload.poolId : undefined;
    const collectionItemSize =
      (poolId ? pools.get(poolId)?.collectionItemSize : undefined) ??
      readTemplateCollectionItemSize(templatePoolEntries, poolId) ??
      DEFAULT_COLLECTION_ITEM_SIZE;

    const sectionId = entry.identifier;
    sections.push({
      sectionId,
      poolId,
      numberOfRows: normalizeNumberOfRows(payload?.maxVisibleRows, poolId, sectionId, onIssue),
      collectionItemSize,
    });
  }

  return sections;
}
