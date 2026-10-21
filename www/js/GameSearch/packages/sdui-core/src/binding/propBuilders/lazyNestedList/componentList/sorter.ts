import { computed, type ReadonlySignal } from "@preact/signals-core";

import { buildDataBindingSourcesSignal } from "../../../SduiDataBinder";
import { reportFailedToParse, stringifyError } from "../../../../errors";
import type {
  DataBindingSources,
  NestedComponentBuildContext,
  PropBuildRequest,
  UiComponentTemplate,
} from "../../../../types";
import { isRecord } from "../../../../utils/typeGuards";
import { unwrapOneOf } from "../../../../utils/oneOfHelper";
import type { ComponentListEntry } from "./types";

function coerceStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item !== "");
  }
  if (isRecord(value) && Array.isArray(value.items)) {
    return value.items.filter((item): item is string => typeof item === "string" && item !== "");
  }
  return undefined;
}

/**
 * Resolve a prop definition through buildProp and collapse reactive signals to
 * the current value.
 */
export function resolvePropToValue(
  propDefinition: unknown,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
  dataSources: ReadonlySignal<DataBindingSources> = request.dataSources,
): unknown {
  if (propDefinition == null || !isRecord(propDefinition)) return undefined;
  if (!unwrapOneOf(propDefinition)) return undefined;

  const result = buildContext.builder.buildProp(propDefinition, dataSources, request.ctx);

  if (result.category === "propSignal") {
    return result.signal.value;
  }
  return result.value;
}

function resolveOrderedIdentifiers(
  orderedIdentifiersProp: unknown,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): string[] | undefined {
  const value = resolvePropToValue(orderedIdentifiersProp, request, buildContext);
  return coerceStringArray(value);
}

function resolveItemSortRank(
  sortRankProp: unknown,
  item: unknown,
  perItemTemplate: UiComponentTemplate,
  buildDeps: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): number | undefined {
  // early return for entries with no rank.
  if (sortRankProp == null || !isRecord(sortRankProp) || !unwrapOneOf(sortRankProp)) {
    return undefined;
  }

  const itemData = isRecord(item) ? item : {};
  const itemInputSignal = computed(() => itemData);
  const perItemSources: ReadonlySignal<DataBindingSources> = buildDataBindingSourcesSignal(
    itemInputSignal,
    perItemTemplate.shared.hydrationDataSpecs,
    buildDeps.ctx,
  );

  try {
    const rawRank = resolvePropToValue(sortRankProp, buildDeps, buildContext, perItemSources);
    const numericRank = Number(rawRank);
    return Number.isFinite(numericRank) ? numericRank : undefined;
  } catch (err) {
    reportFailedToParse(
      buildDeps.ctx,
      `Failed to resolve ComponentList sort_rank: ${stringifyError(err)}`,
    );
    return undefined;
  }
}

function compareEntryRank(
  a: { rank: number | undefined; originalIndex: number },
  b: { rank: number | undefined; originalIndex: number },
): number {
  if (a.rank === b.rank) return a.originalIndex - b.originalIndex; // tie → keep prior order
  if (a.rank === undefined) return 1; // a unranked → a goes after
  if (b.rank === undefined) return -1; // b unranked → b goes after
  return a.rank - b.rank; // both ranked → ascending
}

export function applyOrder(
  entries: ComponentListEntry[],
  orderedIdentifiersProp: unknown,
  buildDeps: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): ComponentListEntry[] {
  let orderedEntries = entries;

  const orderedIdentifiers = resolveOrderedIdentifiers(
    orderedIdentifiersProp,
    buildDeps,
    buildContext,
  );
  if (orderedIdentifiers) {
    const entryByIdentifier = new Map<string, ComponentListEntry>();
    for (const entry of orderedEntries) {
      if (entry.identifier) entryByIdentifier.set(entry.identifier, entry);
    }
    const reordered: ComponentListEntry[] = [];
    for (const identifier of orderedIdentifiers) {
      const match = entryByIdentifier.get(identifier);
      if (match) reordered.push(match);
    }
    orderedEntries = reordered;
  }

  // return early if no entries have a sort rank.
  const anyEntryHasSortRank = orderedEntries.some(entry => entry.sortRankProp != null);
  if (!anyEntryHasSortRank) return orderedEntries;

  const resolvedSortRanks: (number | undefined)[] = [];
  for (let index = 0; index < orderedEntries.length; index += 1) {
    const entry = orderedEntries[index];
    if (entry?.template) {
      resolvedSortRanks[index] = resolveItemSortRank(
        entry.sortRankProp,
        entry.item,
        entry.template,
        buildDeps,
        buildContext,
      );
    }
  }

  const indexedEntriesWithRanks = orderedEntries.map((entry, index) => ({
    entry,
    rank: resolvedSortRanks[index],
    originalIndex: index,
  }));
  indexedEntriesWithRanks.sort(compareEntryRank);
  return indexedEntriesWithRanks.map(({ entry }) => entry);
}
