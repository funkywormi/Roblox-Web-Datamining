import { DataStatus, type PoolBuildMetadata } from "../types";
import { normalizePools, type NormalizePoolIssue } from "./normalizePools";
import {
  normalizeSections,
  type NormalizeSectionIssue,
  type PoolSectionInput,
} from "./normalizeSections";
import type { NormalizedPool, PoolId, PoolSnapshot } from "./types";

export interface BuildPoolSnapshotInput {
  readonly sourceEntries: readonly PoolSectionInput[];
  readonly orderedEntries: readonly PoolSectionInput[];
  readonly resolvedPools: unknown;
  readonly poolDataStatus?: DataStatus;
  readonly templatePoolEntries?: unknown;
}

export type BuildPoolSnapshotIssue =
  | NormalizePoolIssue
  | NormalizeSectionIssue
  | {
      readonly reason: "missingReferencedPool";
      readonly entryIndex: number;
      readonly sectionId: string;
      readonly poolId: PoolId;
    };

export type BuildPoolSnapshotResult =
  | {
      readonly success: true;
      readonly snapshot: PoolSnapshot;
      readonly metadataBySectionId: ReadonlyMap<string, PoolBuildMetadata>;
      readonly issues: readonly BuildPoolSnapshotIssue[];
    }
  | {
      readonly success: false;
      readonly reason: "missingSectionId" | "duplicateSectionId";
      readonly entryIndex: number;
      readonly sectionId?: string;
      readonly poolId?: PoolId;
    };

export function buildPoolSnapshot({
  sourceEntries,
  orderedEntries,
  resolvedPools,
  poolDataStatus = DataStatus.Ready,
  templatePoolEntries,
}: BuildPoolSnapshotInput): BuildPoolSnapshotResult {
  const metadataBySectionId = new Map<string, PoolBuildMetadata>();
  const shouldReconcilePoolData = poolDataStatus !== DataStatus.NotReady;

  for (let sourceEntryIndex = 0; sourceEntryIndex < sourceEntries.length; sourceEntryIndex += 1) {
    const sourceEntrySectionId = sourceEntries[sourceEntryIndex]?.identifier;
    if (typeof sourceEntrySectionId !== "string" || sourceEntrySectionId.length === 0) {
      return { success: false, reason: "missingSectionId", entryIndex: sourceEntryIndex };
    }

    if (metadataBySectionId.has(sourceEntrySectionId)) {
      return {
        success: false,
        reason: "duplicateSectionId",
        entryIndex: sourceEntryIndex,
        sectionId: sourceEntrySectionId,
      };
    }

    metadataBySectionId.set(sourceEntrySectionId, { sectionId: sourceEntrySectionId });
  }

  const issues: BuildPoolSnapshotIssue[] = [];
  const normalizedPoolsById: ReadonlyMap<PoolId, NormalizedPool> = shouldReconcilePoolData
    ? normalizePools(resolvedPools, issue => issues.push(issue))
    : new Map();
  const orderedSectionRegistrations = normalizeSections(
    orderedEntries,
    normalizedPoolsById,
    templatePoolEntries,
    issue => issues.push(issue),
  );
  const missingPoolIds = new Set<PoolId>();
  if (orderedSectionRegistrations.length !== orderedEntries.length) {
    let mismatchedEntryIndex = 0;
    // find the first index where the IDs mismatch
    while (
      mismatchedEntryIndex < orderedSectionRegistrations.length &&
      orderedEntries[mismatchedEntryIndex]?.identifier ===
        orderedSectionRegistrations[mismatchedEntryIndex]?.sectionId
    ) {
      mismatchedEntryIndex += 1;
    }
    return {
      success: false,
      reason: "missingSectionId",
      entryIndex: mismatchedEntryIndex,
    };
  }
  for (
    let orderedSectionIndex = 0;
    orderedSectionIndex < orderedSectionRegistrations.length;
    orderedSectionIndex += 1
  ) {
    const sectionRegistration = orderedSectionRegistrations[orderedSectionIndex];
    if (
      shouldReconcilePoolData &&
      sectionRegistration?.poolId &&
      !normalizedPoolsById.has(sectionRegistration.poolId)
    ) {
      issues.push({
        reason: "missingReferencedPool",
        entryIndex: orderedSectionIndex,
        sectionId: sectionRegistration.sectionId,
        poolId: sectionRegistration.poolId,
      });
      missingPoolIds.add(sectionRegistration.poolId);
    }
  }

  return {
    success: true,
    snapshot: {
      pools: shouldReconcilePoolData ? normalizedPoolsById : undefined,
      ...(missingPoolIds.size > 0 ? { missingPoolIds } : {}),
      sections: orderedSectionRegistrations,
    },
    metadataBySectionId,
    issues,
  };
}
