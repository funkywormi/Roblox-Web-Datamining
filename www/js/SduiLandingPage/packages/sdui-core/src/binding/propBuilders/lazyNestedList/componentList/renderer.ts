import { computed, type ReadonlySignal } from "@preact/signals-core";

import { createDeferredSduiComponentConfig } from "../../../deferredSduiComponentConfig";
import { reportInvalidConfig } from "../../../../errors";
import { shallowValueEqual } from "../../../../signals/computedEqual";
import type {
  DataBindingSources,
  NestedComponentBuildContext,
  PoolBuildMetadata,
  PropBuildRequest,
  SduiComponentConfig,
} from "../../../../types";
import { asRecordOrEmpty, isRecord, type RecordOf } from "../../../../utils/typeGuards";
import { unwrapOneOf } from "../../../../utils/oneOfHelper";
import { createInputDataSignals, resolveInputDefs } from "../../utils/resolveInputs";
import { overlayDataSources } from "../shared";
import type { ComponentListEntry } from "./types";

export interface InputSlice {
  inputDataSignal: ReadonlySignal<Record<string, unknown> | undefined>;
  pendingInputKeysSignal?: ReadonlySignal<ReadonlySet<string>>;
  parentDataSources?: ReadonlySignal<DataBindingSources>;
  poolBuildMetadata?: PoolBuildMetadata;
}

export type InputSlicer = (entry: ComponentListEntry, isUniqueIdentifier: boolean) => InputSlice;

/** A stable child config and the entry structure it was built from. */
export interface CachedEntryConfig {
  config: SduiComponentConfig;
  entry: ComponentListEntry;
  identity: "unique" | "position" | "poolIndex";
  reactKey: string;
}

/**
 * Per-render reuse cache. Entries are keyed two ways so the next render can
 * reuse a built config whether or not the row carries an identifier:
 *   - `byIdentifier`: reorder-safe lookup for rows whose identifier is unique
 *     in this list. Duplicate ids are omitted so two rows cannot share one
 *     cached config.
 *   - `byIndex`: positional fallback for unkeyed rows and duplicate-id rows
 *     (array_map-style paginating grids/carousels). Only safe when no sort
 *     layer can shift an entry's display index between renders.
 */
export interface EntryConfigCache {
  byIdentifier: Map<string, CachedEntryConfig>;
  byIndex: CachedEntryConfig[];
  byPoolIndex: Map<number, CachedEntryConfig>;
}

export interface BuildEntryConfigsResult {
  configs: SduiComponentConfig[];
  cache: EntryConfigCache;
}

let nextOpaqueReactKey = 0;

function createReactKey(identifier: string | undefined): string {
  if (identifier) return `component-list:id:${identifier}`;
  nextOpaqueReactKey += 1;
  return `component-list:row:${nextOpaqueReactKey}`;
}

function createPoolItemReactKey(poolIndex: number): string {
  return `component-list:pool:${poolIndex}`;
}

function unwrapEntryData(entryData: unknown): RecordOf {
  if (!isRecord(entryData)) return { value: entryData };
  const unwrapped = unwrapOneOf(entryData.inputData);
  if (unwrapped && isRecord(unwrapped.propValue)) {
    return { ...asRecordOrEmpty(unwrapped.propValue) };
  }
  return { ...entryData };
}

function indexUniqueIdentifiers<T>(
  items: Iterable<T>,
  getIdentifier: (item: T) => string | undefined,
): Map<string, T> {
  const uniqueItems = new Map<string, T>();
  const duplicates = new Set<string>();
  for (const item of items) {
    const identifier = getIdentifier(item);
    if (!identifier || duplicates.has(identifier)) continue;
    if (uniqueItems.delete(identifier)) {
      duplicates.add(identifier);
    } else {
      uniqueItems.set(identifier, item);
    }
  }
  return uniqueItems;
}

export function createInputSlicer(
  buildDeps: PropBuildRequest,
  boundSourceSignal?: ReadonlySignal<unknown>,
  resolveEntryItem?: (entry: ComponentListEntry) => unknown,
): InputSlicer {
  const boundArrayIndexes = new WeakMap<unknown[], ReadonlyMap<string, unknown>>();
  const resolveBoundItem = (identifier: string): unknown => {
    const raw = boundSourceSignal?.value;
    if (!Array.isArray(raw)) return isRecord(raw) ? raw[identifier] : undefined;

    let byIdentifier = boundArrayIndexes.get(raw);
    if (!byIdentifier) {
      byIdentifier = indexUniqueIdentifiers(raw, item => {
        if (!isRecord(item)) return undefined;
        return typeof item.identifier === "string" ? item.identifier : undefined;
      });
      boundArrayIndexes.set(raw, byIdentifier);
    }
    return byIdentifier.get(identifier);
  };

  return (entry, isUniqueIdentifier) => {
    const resolveItem = (): unknown => {
      if (resolveEntryItem) return resolveEntryItem(entry);
      if (!isUniqueIdentifier || !entry.identifier || !boundSourceSignal) return entry.item;
      return resolveBoundItem(entry.identifier);
    };

    if (entry.sourceMode === "literal") {
      if (entry.isInline) {
        return {
          inputDataSignal: computed(() => buildDeps.dataSources.value.inputData),
          parentDataSources: buildDeps.dataSources,
        };
      }
      return createInputDataSignals(() => resolveInputDefs(entry.inputs ?? {}, buildDeps));
    }

    if (entry.isInline) {
      const overlaySources = computed(() => {
        const currentItem = resolveItem();
        const overlay = isRecord(currentItem) ? currentItem : {};
        return overlayDataSources(buildDeps.dataSources.value, overlay);
      });
      return {
        inputDataSignal: computed(() => overlaySources.value.inputData),
        parentDataSources: overlaySources,
      };
    }

    return createInputDataSignals(() =>
      resolveInputDefs(entry.inputs ?? {}, buildDeps, unwrapEntryData(resolveItem())),
    );
  };
}

function entryStructureMatches(previous: ComponentListEntry, entry: ComponentListEntry): boolean {
  return (
    previous.template === entry.template &&
    previous.inputs === entry.inputs &&
    previous.isInline === entry.isInline &&
    previous.sourceMode === entry.sourceMode
  );
}

export function findUniqueIdentifiers(entries: ComponentListEntry[]): Set<string> {
  return new Set(indexUniqueIdentifiers(entries, entry => entry.identifier).keys());
}

function findReusableEntry(
  previousCache: EntryConfigCache,
  entry: ComponentListEntry,
  displayIndex: number,
  allowPositionalReuse: boolean,
  uniqueIdentifiers: Set<string>,
): CachedEntryConfig | undefined {
  const { identifier } = entry;
  const poolIndex = entry.poolPlacement?.poolIndex;
  const isUniquelyIdentified = identifier != null && uniqueIdentifiers.has(identifier);
  const candidate =
    poolIndex !== undefined
      ? previousCache.byPoolIndex.get(poolIndex)
      : isUniquelyIdentified
        ? previousCache.byIdentifier.get(identifier)
        : allowPositionalReuse
          ? previousCache.byIndex[displayIndex]
          : undefined;
  if (!candidate) return undefined;

  const identity =
    poolIndex !== undefined ? "poolIndex" : isUniquelyIdentified ? "unique" : "position";
  if (candidate.identity !== identity) return undefined;
  const { entry: previous } = candidate;
  if (!entryStructureMatches(previous, entry)) return undefined;
  if (identity === "poolIndex") return candidate;
  if (isUniquelyIdentified) return candidate;
  if (previous.identifier !== identifier || !shallowValueEqual(previous.item, entry.item)) {
    return undefined;
  }
  return candidate;
}

/**
 * Reuse `previousCache` across recomputes of the same ComponentList signal
 * (bound or literal). A missing cache builds every config fresh.
 */
export function buildEntryConfigs(
  entries: ComponentListEntry[],
  inputSlicer: InputSlicer,
  previousCache: EntryConfigCache | undefined,
  allowPositionalReuse: boolean,
  buildContext: NestedComponentBuildContext,
  buildDeps: PropBuildRequest,
  sourceUniqueIdentifiers?: ReadonlySet<string>,
  deferItemBuild = false,
): BuildEntryConfigsResult {
  const result: SduiComponentConfig[] = [];
  const byIdentifier = new Map<string, CachedEntryConfig>();
  const byIndex: CachedEntryConfig[] = [];
  const byPoolIndex = new Map<number, CachedEntryConfig>();
  const uniqueIdentifiers = findUniqueIdentifiers(entries);
  if (sourceUniqueIdentifiers) {
    // Ordering can collapse duplicate IDs into one row.
    // Only treat an ID as unique if it was unique before ordering.
    for (const identifier of uniqueIdentifiers) {
      if (!sourceUniqueIdentifiers.has(identifier)) uniqueIdentifiers.delete(identifier);
    }
  }

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry) continue;

    const { identifier } = entry;
    const poolIndex = entry.poolPlacement?.poolIndex;
    const isUniquelyIdentified = identifier != null && uniqueIdentifiers.has(identifier);
    let nestedConfig: SduiComponentConfig | undefined;
    let reactKey: string | undefined;

    if (previousCache) {
      const cached = findReusableEntry(
        previousCache,
        entry,
        index,
        allowPositionalReuse,
        uniqueIdentifiers,
      );
      if (cached) {
        const { config, reactKey: cachedReactKey } = cached;
        nestedConfig = config;
        reactKey = cachedReactKey;
      }
    }

    if (!nestedConfig) {
      const { template } = entry;
      if (!template) {
        reportInvalidConfig(
          buildDeps.ctx,
          `No template found for ComponentList item (identifier: ${entry.identifier ?? String(index)})`,
        );
        continue;
      }

      const { inputDataSignal, pendingInputKeysSignal, parentDataSources, poolBuildMetadata } =
        inputSlicer(entry, isUniquelyIdentified);
      const parentSources = entry.isInline ? parentDataSources : undefined;
      const buildConfig = () =>
        buildContext.builder.buildConfigForComponent(
          template,
          inputDataSignal,
          buildContext.builderConfig,
          buildContext.parentAnalyticsContext,
          parentSources,
          pendingInputKeysSignal,
          poolBuildMetadata ?? buildContext.poolBuildMetadata,
        );
      // Filterable entries must build eagerly — deferred shells have no isComponentFilteredSignal yet.
      nestedConfig =
        deferItemBuild && template.shared.isComponentFiltered == null
          ? createDeferredSduiComponentConfig(
              template.shared.componentType,
              buildConfig,
              buildDeps.ctx,
            )
          : buildConfig();

      if (!nestedConfig) continue;
    }

    result.push(nestedConfig);

    const renderIdentifier =
      poolIndex === undefined && isUniquelyIdentified ? identifier : undefined;
    const identity =
      poolIndex !== undefined ? "poolIndex" : isUniquelyIdentified ? "unique" : "position";
    const cacheEntry: CachedEntryConfig = {
      config: nestedConfig,
      entry,
      identity,
      reactKey:
        reactKey ??
        (poolIndex !== undefined
          ? createPoolItemReactKey(poolIndex)
          : createReactKey(renderIdentifier)),
    };
    byIndex[index] = cacheEntry;
    if (renderIdentifier) byIdentifier.set(renderIdentifier, cacheEntry);
    if (poolIndex !== undefined) byPoolIndex.set(poolIndex, cacheEntry);
    nestedConfig.identifier = renderIdentifier;
    nestedConfig.reactKey = cacheEntry.reactKey;
    if (entry.poolPlacement) nestedConfig.poolPlacement = entry.poolPlacement;
  }

  return { configs: result, cache: { byIdentifier, byIndex, byPoolIndex } };
}
