/**
 * `component_list` variant — unified V2 list spec covering array_map,
 * item_list, and ordered_template_data use cases.
 *
 * The component list pipeline is a 3-stage process:
 * 1. Normalization: converts the raw source (ItemList for literal, or a binding-resolved table for bindingPath) into a flat list of fully-prepared Entries.
 * 2. Ordering: sorts the entries by sort rank (if present), and by original index as a tie-breaker.
 * 3. Rendering: builds a config for every entry with a resolvable template. Visibility filtering is applied once via `wrapVisibleConfigListSignal` so child filter signals can flip without rebuilding the whole list.
 */
import { computed, type ReadonlySignal } from "@preact/signals-core";

import { reportFailedToParse, reportInvalidConfig, stringifyError } from "../../../../errors";
import type {
  BindingContext,
  NestedComponentBuildContext,
  PropBuildRequest,
  ResolvedProp,
  SduiComponentConfig,
} from "../../../../types";
import { isRecord, type RecordOf } from "../../../../utils/typeGuards";
import { isOneOf } from "../../../../utils/oneOfHelper";
import { computedEqual } from "../../../../signals/computedEqual";
import { createDynamicBindingRead } from "../../utils/sduiPropSignalUtils";
import { arrayRefEqual, emptyListPropSignal, isComponentVisible } from "../shared";
import { normalizeBoundData, normalizeLiteralItems } from "./normalizer";
import { applyOrder } from "./sorter";
import {
  buildEntryConfigs,
  createInputSlicer,
  findUniqueIdentifiers,
  type BuildEntryConfigsResult,
  type EntryConfigCache,
  type InputSlicer,
} from "./renderer";
import type { ComponentListEntry, NormalizedComponentList } from "./types";

function canSorterReorder(entries: ComponentListEntry[], orderedIdentifiersProp: unknown): boolean {
  if (orderedIdentifiersProp != null) return true;
  return entries.some(entry => entry.sortRankProp != null);
}

function buildItemsFromEntries(
  entries: ComponentListEntry[],
  orderedIdentifiersProp: unknown,
  previousCache: EntryConfigCache | undefined,
  inputSlicer: InputSlicer,
  buildDeps: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): BuildEntryConfigsResult {
  const allowPositionalReuse = !canSorterReorder(entries, orderedIdentifiersProp);
  const sourceUniqueIdentifiers = findUniqueIdentifiers(entries);
  const orderedEntries = applyOrder(entries, orderedIdentifiersProp, buildDeps, buildContext);
  return buildEntryConfigs(
    orderedEntries,
    inputSlicer,
    previousCache,
    allowPositionalReuse,
    buildContext,
    buildDeps,
    sourceUniqueIdentifiers,
  );
}

function createBoundDataParser(
  defaultItem: RecordOf | undefined,
  itemOverrides: Record<string, RecordOf> | undefined,
  orderedIdentifiersProp: unknown,
  buildDeps: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
  boundSourceSignal: ReadonlySignal<unknown>,
): (raw: unknown) => SduiComponentConfig[] {
  let previousCache: EntryConfigCache | undefined;
  const inputSlicer = createInputSlicer(buildDeps, boundSourceSignal);

  return raw => {
    const entries = normalizeBoundData(
      raw,
      defaultItem,
      itemOverrides,
      buildContext.templateStore,
      buildDeps.ctx,
    );
    const { configs, cache } = buildItemsFromEntries(
      entries,
      orderedIdentifiersProp,
      previousCache,
      inputSlicer,
      buildDeps,
      buildContext,
    );
    previousCache = cache;
    return configs;
  };
}

function buildLiteralConfigs(
  items: unknown[],
  defaultItem: RecordOf | undefined,
  orderedIdentifiersProp: unknown,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): SduiComponentConfig[] {
  try {
    const inputSlicer = createInputSlicer(request);
    const entries = normalizeLiteralItems(
      items,
      defaultItem,
      buildContext.templateStore,
      request.ctx,
    );
    const { configs } = buildItemsFromEntries(
      entries,
      orderedIdentifiersProp,
      undefined,
      inputSlicer,
      request,
      buildContext,
    );
    return configs;
  } catch (err) {
    reportFailedToParse(
      request.ctx,
      `Failed to build ComponentList from literal source: ${stringifyError(err)}`,
    );
    return [];
  }
}

function wrapVisibleConfigListSignal(
  listSignal: ReadonlySignal<SduiComponentConfig[]>,
): ResolvedProp {
  // Keep only currently-visible children. Reading each child's filter signal here
  // means a child hiding/showing just re-runs this filter — the configs below are
  // never rebuilt.
  const visibleConfigsSignal = computedEqual<SduiComponentConfig[]>(() => {
    const childConfigs = listSignal.value;
    return Array.isArray(childConfigs) ? childConfigs.filter(isComponentVisible) : [];
  }, arrayRefEqual);
  return {
    value: visibleConfigsSignal.peek(),
    category: "propSignal",
    signal: visibleConfigsSignal,
  };
}

export function buildComponentList(
  propData: RecordOf,
  buildDeps: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): ResolvedProp {
  const ctx: BindingContext = { ...buildDeps.ctx, parserName: "component_list" };
  const childRequest: PropBuildRequest = { ...buildDeps, ctx };

  const list = propData as NormalizedComponentList;
  const {
    source,
    orderedIdentifiers: orderedIdentifiersProp,
    defaultItem: rawDefaultItem,
    itemOverrides: rawItemOverrides,
  } = list;
  const defaultItem =
    isRecord(rawDefaultItem) && Object.keys(rawDefaultItem).length > 0 ? rawDefaultItem : undefined;
  const rawOverrideEntries = isRecord(rawItemOverrides)
    ? Object.entries(rawItemOverrides).filter((entry): entry is [string, RecordOf] =>
        isRecord(entry[1]),
      )
    : [];
  const itemOverrides: Record<string, RecordOf> | undefined =
    rawOverrideEntries.length > 0 ? Object.fromEntries(rawOverrideEntries) : undefined;

  if (!isOneOf(source)) {
    reportInvalidConfig(ctx, "ComponentList missing source");
    return emptyListPropSignal();
  }

  if (source.kind === "bindingPath" || source.kind === "binding_path") {
    const bindingPath = typeof source.value === "string" ? source.value : "";
    if (!bindingPath) {
      reportInvalidConfig(ctx, "ComponentList bindingPath source missing bindingPath");
      return emptyListPropSignal();
    }

    const boundRead = createDynamicBindingRead(bindingPath, childRequest);
    const boundSourceSignal = computed(() => boundRead.value.value);
    const parseBoundData = createBoundDataParser(
      defaultItem,
      itemOverrides,
      orderedIdentifiersProp,
      childRequest,
      buildContext,
      boundSourceSignal,
    );
    const arraySignal = computedEqual<SduiComponentConfig[]>(
      () => parseBoundData(boundSourceSignal.value),
      arrayRefEqual,
    );

    return wrapVisibleConfigListSignal(arraySignal);
  }

  if (source.kind === "literal") {
    const itemList = isRecord(source.value) ? source.value : undefined;
    const items = Array.isArray(itemList?.items) ? itemList.items : undefined;
    if (!items) {
      return emptyListPropSignal();
    }

    const listSignal = computedEqual<SduiComponentConfig[]>(
      () =>
        buildLiteralConfigs(items, defaultItem, orderedIdentifiersProp, childRequest, buildContext),
      arrayRefEqual,
    );

    return wrapVisibleConfigListSignal(listSignal);
  }

  reportInvalidConfig(ctx, `Unknown ComponentList source kind: ${source.kind}`);
  return emptyListPropSignal();
}
