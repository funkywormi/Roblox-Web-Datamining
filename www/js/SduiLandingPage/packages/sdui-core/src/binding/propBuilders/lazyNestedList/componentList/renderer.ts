import { computed, type ReadonlySignal } from "@preact/signals-core";

import { reportFailedToParse, reportInvalidConfig, stringifyError } from "../../../../errors";
import {
  asShallowEqualValue,
  computedEqual,
  shallowEqual,
  shallowValueEqual,
} from "../../../../signals/computedEqual";
import type {
  DataBindingSources,
  NestedComponentBuildContext,
  PropBuildRequest,
  SduiComponentConfig,
} from "../../../../types";
import { asRecordOrEmpty, isRecord, type RecordOf } from "../../../../utils/typeGuards";
import { unwrapOneOf } from "../../../../utils/oneOfHelper";
import { resolveInputDefs } from "../../utils/resolveInputs";
import type { ComponentListEntry } from "./types";

export type InputSlicer = (
  entry: ComponentListEntry,
  isUniqueIdentifier: boolean,
) => ReadonlySignal<Record<string, unknown> | undefined>;

/** A stable child config and the entry structure it was built from. */
export interface CachedEntryConfig {
  config: SduiComponentConfig;
  entry: ComponentListEntry;
  identity: "unique" | "position";
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

function unwrapEntryData(entryData: unknown): RecordOf {
  if (!isRecord(entryData)) return { value: entryData };
  const unwrapped = unwrapOneOf(entryData.inputData);
  if (unwrapped && isRecord(unwrapped.propValue)) {
    return { ...asRecordOrEmpty(unwrapped.propValue) };
  }
  return { ...entryData };
}

function createInputDataSignal(
  computeInputData: () => Record<string, unknown> | undefined,
): ReadonlySignal<Record<string, unknown> | undefined> {
  return computedEqual(computeInputData, (previous, next) =>
    shallowEqual(asShallowEqualValue(previous), asShallowEqualValue(next)),
  );
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

function fillInputs(
  data: RecordOf,
  inputs: RecordOf | undefined,
  buildDeps: PropBuildRequest,
): void {
  if (!inputs) return;
  try {
    const resolvedInputs = resolveInputDefs(inputs, buildDeps);
    Object.assign(data, resolvedInputs);
  } catch (err) {
    reportFailedToParse(
      buildDeps.ctx,
      `Failed to build inputs for ComponentList item: ${stringifyError(err)}`,
    );
  }
}

export function createInputSlicer(
  buildDeps: PropBuildRequest,
  boundSourceSignal?: ReadonlySignal<unknown>,
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
      if (!isUniqueIdentifier || !entry.identifier || !boundSourceSignal) return entry.item;
      return resolveBoundItem(entry.identifier);
    };

    if (entry.sourceMode === "literal") {
      if (entry.isInline) {
        return computed(() => buildDeps.dataSources.value.inputData);
      }
      return computed(() => {
        const inputData: RecordOf = {};
        fillInputs(inputData, entry.inputs, buildDeps);
        return inputData;
      });
    }

    if (entry.isInline) {
      return createInputDataSignal(() => {
        const currentItem = resolveItem();
        return {
          ...buildDeps.dataSources.value.inputData,
          ...(isRecord(currentItem) ? currentItem : {}),
        };
      });
    }

    return createInputDataSignal(() => {
      const inputData = unwrapEntryData(resolveItem());
      fillInputs(inputData, entry.inputs, buildDeps);
      return inputData;
    });
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
  const isUniquelyIdentified = identifier != null && uniqueIdentifiers.has(identifier);
  const candidate = isUniquelyIdentified
    ? previousCache.byIdentifier.get(identifier)
    : allowPositionalReuse
      ? previousCache.byIndex[displayIndex]
      : undefined;
  if (!candidate) return undefined;

  const identity = isUniquelyIdentified ? "unique" : "position";
  if (candidate.identity !== identity) return undefined;
  const { entry: previous } = candidate;
  if (!entryStructureMatches(previous, entry)) return undefined;
  if (isUniquelyIdentified) return candidate;
  if (previous.identifier !== identifier || !shallowValueEqual(previous.item, entry.item)) {
    return undefined;
  }
  return candidate;
}

/**
 * Reuse `previousCache` only with a slicer created from a bound source.
 * Literal lists pass `undefined` so every config is built fresh.
 */
export function buildEntryConfigs(
  entries: ComponentListEntry[],
  inputSlicer: InputSlicer,
  previousCache: EntryConfigCache | undefined,
  allowPositionalReuse: boolean,
  buildContext: NestedComponentBuildContext,
  buildDeps: PropBuildRequest,
  sourceUniqueIdentifiers?: ReadonlySet<string>,
): BuildEntryConfigsResult {
  const result: SduiComponentConfig[] = [];
  const byIdentifier = new Map<string, CachedEntryConfig>();
  const byIndex: CachedEntryConfig[] = [];
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
      if (!entry.template) {
        reportInvalidConfig(
          buildDeps.ctx,
          `No template found for ComponentList item (identifier: ${entry.identifier ?? String(index)})`,
        );
        continue;
      }

      const inputDataSignal = inputSlicer(entry, isUniquelyIdentified);
      // Overlay the slicer's merged `inputData` (parent + per-row item) onto the parent sources so
      // inline children bind against the row data instead of stale parent data.
      const parentSources = entry.isInline
        ? computed<DataBindingSources>(() => ({
            ...buildDeps.dataSources.value,
            inputData: inputDataSignal.value ?? buildDeps.dataSources.value.inputData,
          }))
        : undefined;
      nestedConfig = buildContext.builder.buildConfigForComponent(
        entry.template,
        inputDataSignal,
        buildContext.builderConfig,
        buildContext.parentAnalyticsContext,
        parentSources,
      );

      if (!nestedConfig) continue;
    }

    result.push(nestedConfig);

    const renderIdentifier = isUniquelyIdentified ? identifier : undefined;
    const cacheEntry: CachedEntryConfig = {
      config: nestedConfig,
      entry,
      identity: isUniquelyIdentified ? "unique" : "position",
      reactKey: reactKey ?? createReactKey(renderIdentifier),
    };
    byIndex[index] = cacheEntry;
    if (renderIdentifier) byIdentifier.set(renderIdentifier, cacheEntry);
    nestedConfig.identifier = renderIdentifier;
    nestedConfig.reactKey = cacheEntry.reactKey;
  }

  return { configs: result, cache: { byIdentifier, byIndex } };
}
