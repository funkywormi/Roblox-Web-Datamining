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

import {
  reportBindingError,
  reportFailedToParse,
  reportInvalidConfig,
  SduiErrorName,
  stringifyError,
} from "../../../../errors";
import type {
  BindingContext,
  HydrationRead,
  NestedComponentBuildContext,
  PropBuildRequest,
  ResolvedProp,
  SduiComponentConfig,
  SduiPooledConfigList,
} from "../../../../types";
import { DataStatus } from "../../../../types";
import { isRecord, type RecordOf } from "../../../../utils/typeGuards";
import { isOneOf } from "../../../../utils/oneOfHelper";
import { computedEqual } from "../../../../signals/computedEqual";
import { createSduiPooledConfigList } from "../../../propValues";
import {
  buildPoolSnapshot,
  isSectionId,
  type BuildPoolSnapshotIssue,
  type BuildPoolSnapshotResult,
  type PoolCell,
} from "../../../../pooling";
import { createDynamicBindingRead } from "../../utils/sduiPropSignalUtils";
import { shouldEmitDeferredListItemShells } from "../../utils/shouldEmitDeferredListItemShells";
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

interface PoolSnapshotInput {
  resolvedPoolData: unknown;
  poolDataStatus: DataStatus;
  templatePoolEntriesByPoolId: unknown;
}

interface PoolErrorMetadata {
  sectionId?: string;
  poolId?: string;
  poolIndex?: number;
  itemKind?: string;
}

function reportPoolError(
  errorName: SduiErrorName,
  ctx: BindingContext,
  configKey: string,
  message: string,
  metadata: PoolErrorMetadata = {},
): void {
  const { sectionId, poolId, poolIndex, itemKind } = metadata;
  reportBindingError(
    errorName,
    ctx,
    message,
    { name: sectionId ?? poolId ?? configKey },
    {
      additionalTags: {
        configKey,
        ...(sectionId ? { sectionId } : {}),
        ...(poolId ? { poolId } : {}),
        ...(poolIndex !== undefined ? { poolIndex } : {}),
        ...(itemKind ? { itemKind } : {}),
      },
    },
  );
}

function createEmptyBuildResult(): BuildEntryConfigsResult {
  return {
    configs: [],
    cache: { byIdentifier: new Map(), byIndex: [], byPoolIndex: new Map() },
  };
}

function canSorterReorder(entries: ComponentListEntry[], orderedIdentifiersProp: unknown): boolean {
  if (orderedIdentifiersProp != null) return true;
  return entries.some(entry => entry.sortRankProp != null);
}

type PoolSnapshotFailureReason = Extract<BuildPoolSnapshotResult, { success: false }>["reason"];

function poolSnapshotFailureReasonToSduiErrorName(
  reason: PoolSnapshotFailureReason,
): SduiErrorName {
  switch (reason) {
    case "missingSectionId":
      return SduiErrorName.PoolSectionIdMissing;
    case "duplicateSectionId":
      return SduiErrorName.PoolSectionDuplicate;
  }
}

function reportPoolSnapshotIssues(
  issues: readonly BuildPoolSnapshotIssue[],
  ctx: BindingContext,
  configKey: string,
): void {
  for (const issue of issues) {
    switch (issue.reason) {
      case "missingReferencedPool":
        reportPoolError(
          SduiErrorName.PoolReferenceMissing,
          ctx,
          configKey,
          `Pool section "${issue.sectionId}" references missing pool "${issue.poolId}"`,
          issue,
        );
        break;
      case "malformedPool":
        reportPoolError(
          SduiErrorName.PoolMalformed,
          ctx,
          configKey,
          issue.poolId
            ? `Pool "${issue.poolId}" is malformed`
            : "Pooled ComponentList resolved a malformed pool map",
          issue,
        );
        break;
      case "invalidRowBudget":
        reportPoolError(
          SduiErrorName.PoolRowBudgetInvalid,
          ctx,
          configKey,
          `Pool section "${issue.sectionId}" has invalid row budget ${String(issue.rowBudget)}; using one row`,
          issue,
        );
        break;
      case "unsupportedItemKind":
        reportPoolError(
          SduiErrorName.PoolItemKindUnsupported,
          ctx,
          configKey,
          `Pool item kind is unsupported at ranked index ${issue.poolIndex}`,
          issue,
        );
        break;
    }
  }
}

function buildItemsFromEntries(
  entries: ComponentListEntry[],
  orderedIdentifiersProp: unknown,
  previousCache: EntryConfigCache | undefined,
  inputSlicer: InputSlicer,
  deferItemBuild: boolean,
  buildDeps: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
  poolSnapshotInput?: PoolSnapshotInput,
): BuildEntryConfigsResult {
  const allowPositionalReuse = !canSorterReorder(entries, orderedIdentifiersProp);
  const sourceUniqueIdentifiers = findUniqueIdentifiers(entries);
  const orderedEntries = applyOrder(entries, orderedIdentifiersProp, buildDeps, buildContext);

  let activeInputSlicer = inputSlicer;
  if (poolSnapshotInput) {
    const snapshotResult = buildPoolSnapshot({
      sourceEntries: entries,
      orderedEntries,
      resolvedPools: poolSnapshotInput.resolvedPoolData,
      poolDataStatus: poolSnapshotInput.poolDataStatus,
      templatePoolEntries: poolSnapshotInput.templatePoolEntriesByPoolId,
    });
    if (!snapshotResult.success) {
      const errorName = poolSnapshotFailureReasonToSduiErrorName(snapshotResult.reason);
      reportPoolError(
        errorName,
        buildDeps.ctx,
        buildContext.builderConfig.configKey,
        `Pooled ComponentList has ${snapshotResult.reason} at entry ${snapshotResult.entryIndex}`,
        {
          sectionId: snapshotResult.sectionId,
          poolId: snapshotResult.poolId,
        },
      );
      return createEmptyBuildResult();
    }

    if (snapshotResult.issues.length > 0) {
      reportPoolSnapshotIssues(
        snapshotResult.issues,
        buildDeps.ctx,
        buildContext.builderConfig.configKey,
      );
    }

    buildContext.builder.poolRegistry
      .getOrCreate(buildContext.builderConfig.configKey)
      .applySnapshot(snapshotResult.snapshot);
    activeInputSlicer = (entry, isUniqueIdentifier) => {
      const slice = inputSlicer(entry, isUniqueIdentifier);
      const poolBuildMetadata =
        typeof entry.identifier === "string"
          ? snapshotResult.metadataBySectionId.get(entry.identifier)
          : undefined;
      return poolBuildMetadata ? { ...slice, poolBuildMetadata } : slice;
    };
  }

  return buildEntryConfigs(
    orderedEntries,
    activeInputSlicer,
    previousCache,
    allowPositionalReuse,
    buildContext,
    buildDeps,
    sourceUniqueIdentifiers,
    deferItemBuild,
  );
}

function createBoundDataParser(
  defaultItem: RecordOf | undefined,
  itemOverrides: Record<string, RecordOf> | undefined,
  orderedIdentifiersProp: unknown,
  deferItemBuild: boolean,
  buildDeps: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
  boundSourceSignal: ReadonlySignal<unknown>,
  poolDataBindingRead?: ReadonlySignal<HydrationRead>,
  templatePoolEntriesByPoolId?: unknown,
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
      deferItemBuild,
      buildDeps,
      buildContext,
      poolDataBindingRead
        ? {
            resolvedPoolData: poolDataBindingRead.value.value,
            poolDataStatus: poolDataBindingRead.value.status,
            templatePoolEntriesByPoolId,
          }
        : undefined,
    );
    previousCache = cache;
    return configs;
  };
}

/**
 * Builds literal ComponentList configs, reusing prior entry configs across
 * recomputes of the same list signal (e.g. when pool data updates). Without
 * this cache every recompute minted new opaque reactKeys and progressive fill
 * treated the list as replaced.
 */
function createLiteralConfigsBuilder(
  items: unknown[],
  defaultItem: RecordOf | undefined,
  orderedIdentifiersProp: unknown,
  deferItemBuild: boolean,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
  poolDataBindingRead?: ReadonlySignal<HydrationRead>,
  templatePoolEntriesByPoolId?: unknown,
): () => SduiComponentConfig[] {
  let previousCache: EntryConfigCache | undefined;
  const inputSlicer = createInputSlicer(request);

  return () => {
    try {
      const entries = normalizeLiteralItems(
        items,
        defaultItem,
        buildContext.templateStore,
        request.ctx,
      );
      const { configs, cache } = buildItemsFromEntries(
        entries,
        orderedIdentifiersProp,
        previousCache,
        inputSlicer,
        deferItemBuild,
        request,
        buildContext,
        poolDataBindingRead
          ? {
              resolvedPoolData: poolDataBindingRead.value.value,
              poolDataStatus: poolDataBindingRead.value.status,
              templatePoolEntriesByPoolId,
            }
          : undefined,
      );
      previousCache = cache;
      return configs;
    } catch (err) {
      reportFailedToParse(
        request.ctx,
        `Failed to build ComponentList from literal source: ${stringifyError(err)}`,
      );
      return [];
    }
  };
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

type PoolItemCell = Extract<PoolCell, { kind: "item" }>;

function isPoolItemCell(cell: PoolCell): cell is PoolItemCell {
  return cell.kind === "item";
}

function wrapPooledConfigListSignal(
  listSignal: ReadonlySignal<SduiPooledConfigList>,
): ResolvedProp {
  return {
    value: listSignal.peek(),
    category: "propSignal",
    signal: listSignal,
  };
}

interface BuildPooledComponentListOptions {
  ctx: BindingContext;
  orderedIdentifiersProp: unknown;
  itemOverrides: Record<string, RecordOf> | undefined;
  defaultItem: RecordOf | undefined;
  deferItemBuild: boolean;
  childRequest: PropBuildRequest;
  buildContext: NestedComponentBuildContext;
}

function buildPooledComponentList({
  ctx,
  orderedIdentifiersProp,
  itemOverrides,
  defaultItem,
  deferItemBuild,
  childRequest,
  buildContext,
}: BuildPooledComponentListOptions): ResolvedProp {
  const sectionId = buildContext.poolBuildMetadata?.sectionId;
  if (!isSectionId(sectionId)) {
    reportPoolError(
      SduiErrorName.PoolSectionMetadataMissing,
      ctx,
      buildContext.builderConfig.configKey,
      "Pool ComponentList is missing section metadata",
    );
    return emptyListPropSignal();
  }
  const hasInvalidPoolFeatures =
    orderedIdentifiersProp != null ||
    defaultItem?.sortRank != null ||
    Object.values(itemOverrides ?? {}).some(override => override.sortRank != null);
  if (hasInvalidPoolFeatures) {
    reportPoolError(
      SduiErrorName.PoolListFeaturesUnsupported,
      ctx,
      buildContext.builderConfig.configKey,
      "Pool ComponentList does not support orderedIdentifiers or sortRank",
      { sectionId },
    );
  }

  const poolStore = buildContext.poolRegistry.getOrCreate(buildContext.builderConfig.configKey);
  const sectionCells = poolStore.getSectionCells(sectionId);
  const rowCount = poolStore.getSectionRowCount(sectionId);
  const startRow = poolStore.getSectionStartRow(sectionId);
  const columnCount = poolStore.getSectionColumnCount(sectionId);
  const realCells = computed(() => sectionCells.value.filter(isPoolItemCell));
  const itemByPoolIndex = computed(
    () => new Map(realCells.value.map(cell => [cell.poolIndex, cell.item])),
  );
  const inputSlicer = createInputSlicer(childRequest, undefined, entry => {
    const poolIndex = entry.poolPlacement?.poolIndex;
    return poolIndex === undefined ? undefined : itemByPoolIndex.value.get(poolIndex);
  });

  let previousCache: EntryConfigCache | undefined;
  const pooledListSignal = computed<SduiPooledConfigList>(() => {
    const cells = realCells.value;
    const poolLayout = {
      columnCount: columnCount.value,
      rowCount: rowCount.value,
      startRow: startRow.value,
    };
    if (hasInvalidPoolFeatures) {
      return createSduiPooledConfigList([], poolLayout);
    }
    const entries = normalizeBoundData(
      cells.map(cell => cell.item),
      defaultItem,
      itemOverrides,
      buildContext.templateStore,
      childRequest.ctx,
    ).map((entry, index) => {
      const cell = cells[index];
      if (!cell) return entry;
      return {
        ...entry,
        identifier: undefined,
        poolPlacement: {
          poolIndex: cell.poolIndex,
          cellIndex: cell.cellIndex,
          ...(cell.span ? { span: cell.span } : {}),
        },
      };
    });
    const buildableEntries = entries.filter(entry => entry.template !== undefined);
    if (buildableEntries.length !== entries.length) {
      reportPoolError(
        SduiErrorName.PoolItemTemplateMissing,
        ctx,
        buildContext.builderConfig.configKey,
        `Pool section "${sectionId}" has unresolved item templates; failed coordinates remain empty`,
        { sectionId, poolId: poolStore.getSectionPoolId(sectionId) },
      );
    }

    const { configs, cache } = buildEntryConfigs(
      buildableEntries,
      inputSlicer,
      previousCache,
      false,
      buildContext,
      childRequest,
      undefined,
      deferItemBuild,
    );
    previousCache = cache;
    if (configs.length !== buildableEntries.length) {
      reportPoolError(
        SduiErrorName.PoolItemTemplateMissing,
        ctx,
        buildContext.builderConfig.configKey,
        `Pool section "${sectionId}" has unresolved item templates; failed coordinates remain empty`,
        { sectionId, poolId: poolStore.getSectionPoolId(sectionId) },
      );
    }
    const visibleConfigs = configs.filter(isComponentVisible);
    if (visibleConfigs.length !== configs.length) {
      reportPoolError(
        SduiErrorName.PoolItemFiltered,
        ctx,
        buildContext.builderConfig.configKey,
        `Pool section "${sectionId}" contains filtered items; committed coordinates remain empty`,
        { sectionId, poolId: poolStore.getSectionPoolId(sectionId) },
      );
    }
    return createSduiPooledConfigList(visibleConfigs, poolLayout);
  });

  return wrapPooledConfigListSignal(pooledListSignal);
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
    deferItemBuild,
    poolConfig: rawPoolConfig,
  } = list;
  const emitDeferredListItemShells = shouldEmitDeferredListItemShells(
    deferItemBuild,
    buildDeps.ctx.componentType,
  );
  const defaultItem =
    isRecord(rawDefaultItem) && Object.keys(rawDefaultItem).length > 0 ? rawDefaultItem : undefined;
  const rawOverrideEntries = isRecord(rawItemOverrides)
    ? Object.entries(rawItemOverrides).filter((entry): entry is [string, RecordOf] =>
        isRecord(entry[1]),
      )
    : [];
  const itemOverrides: Record<string, RecordOf> | undefined =
    rawOverrideEntries.length > 0 ? Object.fromEntries(rawOverrideEntries) : undefined;
  const poolConfigRecord = isRecord(rawPoolConfig) ? rawPoolConfig : undefined;
  const poolDataBindingPath =
    typeof poolConfigRecord?.poolPath === "string" && poolConfigRecord.poolPath.length > 0
      ? poolConfigRecord.poolPath
      : undefined;
  const hasInvalidPoolDataBindingPath =
    Object.hasOwn(list, "poolConfig") && poolDataBindingPath === undefined;
  const templatePoolEntriesByPoolId = isRecord(poolConfigRecord?.entries)
    ? poolConfigRecord.entries
    : undefined;

  if (!isOneOf(source)) {
    reportInvalidConfig(ctx, "ComponentList missing source");
    return emptyListPropSignal();
  }
  if (hasInvalidPoolDataBindingPath) {
    reportPoolError(
      SduiErrorName.PoolPathMissing,
      ctx,
      buildContext.builderConfig.configKey,
      "ComponentList poolConfig is missing a non-empty string poolPath",
    );
  }

  if (source.kind === "pool") {
    return buildPooledComponentList({
      ctx,
      orderedIdentifiersProp,
      itemOverrides,
      defaultItem,
      deferItemBuild: emitDeferredListItemShells,
      childRequest,
      buildContext,
    });
  }

  const poolDataBindingRead = poolDataBindingPath
    ? createDynamicBindingRead(poolDataBindingPath, childRequest)
    : undefined;

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
      emitDeferredListItemShells,
      childRequest,
      buildContext,
      boundSourceSignal,
      poolDataBindingRead,
      templatePoolEntriesByPoolId,
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

    const buildLiteralConfigs = createLiteralConfigsBuilder(
      items,
      defaultItem,
      orderedIdentifiersProp,
      emitDeferredListItemShells,
      childRequest,
      buildContext,
      poolDataBindingRead,
      templatePoolEntriesByPoolId,
    );
    const listSignal = computedEqual<SduiComponentConfig[]>(
      () => buildLiteralConfigs(),
      arrayRefEqual,
    );

    return wrapVisibleConfigListSignal(listSignal);
  }

  reportInvalidConfig(ctx, `Unknown ComponentList source kind: ${source.kind}`);
  return emptyListPropSignal();
}
