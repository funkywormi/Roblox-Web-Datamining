import { batch, computed, signal, type ReadonlySignal, type Signal } from "@preact/signals-core";
import { SduiErrorName } from "../errors/SduiErrors";
import { asShallowEqualValue, computedEqual, shallowEqual } from "../signals/computedEqual";
import type { SduiErrorReporter, SduiPageContext } from "../types";
import { allocateSection } from "./allocateSection";
import { createCollectionLayoutSource } from "./CollectionLayoutSource";
import { registerSections } from "./registerSections";
import type {
  CollectionLayoutSource,
  ItemLayout,
  NormalizedPool,
  PoolCell,
  PoolId,
  PoolSnapshot,
  RegisteredPoolSection,
  SectionAllocation,
  SectionId,
} from "./types";

export interface SduiContainerMeasurement {
  setWidth(width: number): void;
  release(): void;
}

export interface SduiPoolStore {
  applySnapshot(snapshot: PoolSnapshot): void;
  setFallbackLayoutSource(source: CollectionLayoutSource | undefined): void;
  mountContainerMeasurement(): SduiContainerMeasurement;
  getSectionPoolId(sectionId: SectionId): PoolId | undefined;
  getLayoutSourceSignal(): ReadonlySignal<CollectionLayoutSource | undefined>;
  getSectionCells(sectionId: SectionId): ReadonlySignal<readonly PoolCell[]>;
  getSectionRowCount(sectionId: SectionId): ReadonlySignal<number>;
  getSectionStartRow(sectionId: SectionId): ReadonlySignal<number>;
  getSectionColumnCount(sectionId: SectionId): ReadonlySignal<number>;
  clear(): void;
}

export type PoolStoreIssue =
  | {
      readonly reason: "invalidColumnCount";
      readonly sectionId: SectionId;
      readonly poolId: PoolId;
      readonly columnCount: number;
    }
  | {
      readonly reason: "allocationFailed";
      readonly sectionId: SectionId;
      readonly poolId: PoolId;
      readonly error: unknown;
    };

export interface CreateSduiPoolStoreOptions {
  errorReporter: SduiErrorReporter;
  pageContext: SduiPageContext;
  configKey: string;
  fallbackLayout: {
    screenWidth: number | undefined;
  };
}

const EMPTY_POOL_CELLS: readonly PoolCell[] = [];

function isValidContainerWidth(width: number | undefined): width is number {
  return typeof width === "number" && Number.isFinite(width) && width > 0;
}

function isItemLayoutEqual(left: ItemLayout | undefined, right: ItemLayout | undefined): boolean {
  return shallowEqual(asShallowEqualValue(left), asShallowEqualValue(right));
}

function isPoolCellEqual(leftCell: PoolCell, rightCell: PoolCell): boolean {
  if (leftCell.kind === "blank" && rightCell.kind === "blank") {
    return leftCell.cellIndex === rightCell.cellIndex;
  }

  if (leftCell.kind === "item" && rightCell.kind === "item") {
    return (
      leftCell.cellIndex === rightCell.cellIndex &&
      leftCell.poolIndex === rightCell.poolIndex &&
      leftCell.item === rightCell.item &&
      isItemLayoutEqual(leftCell.span, rightCell.span)
    );
  }

  return false;
}

function isPoolCellListEqual(
  leftList: readonly PoolCell[],
  rightList: readonly PoolCell[],
): boolean {
  if (leftList === rightList) {
    return true;
  }

  if (leftList.length !== rightList.length) {
    return false;
  }

  return leftList.every((leftCell, index) => {
    const rightCell = rightList[index];

    if (rightCell === undefined) {
      return false;
    }

    return isPoolCellEqual(leftCell, rightCell);
  });
}

function reportPoolIssue(
  errorReporter: SduiErrorReporter,
  pageContext: SduiPageContext,
  configKey: string,
  issue: PoolStoreIssue,
): void {
  const isColumnIssue = issue.reason === "invalidColumnCount";
  errorReporter.reportSduiError(
    isColumnIssue ? SduiErrorName.PoolColumnCountInvalid : SduiErrorName.PoolAllocationFailed,
    isColumnIssue
      ? `Pool section "${issue.sectionId}" resolved invalid column count ${String(issue.columnCount)}`
      : `Pool allocation failed for section "${issue.sectionId}": ${issue.error instanceof Error ? issue.error.message : String(issue.error)}`,
    pageContext,
    { name: issue.sectionId },
    {
      additionalTags: {
        configKey,
        sectionId: issue.sectionId,
        poolId: issue.poolId,
        ...(isColumnIssue ? { columnCount: issue.columnCount } : {}),
      },
    },
  );
}

export function createSduiPoolStore(options: CreateSduiPoolStoreOptions): SduiPoolStore {
  const poolSignals = new Map<PoolId, Signal<NormalizedPool | undefined>>();
  const sectionSignals = new Map<SectionId, Signal<RegisteredPoolSection | undefined>>();
  const initialContainerWidth = options.fallbackLayout.screenWidth;
  const layoutSourceSignal = signal<CollectionLayoutSource | undefined>(
    createCollectionLayoutSource({ screenWidth: initialContainerWidth }),
  );

  const columnCountSignals = new Map<SectionId, ReadonlySignal<number>>();
  const allocationSignals = new Map<SectionId, ReadonlySignal<SectionAllocation | undefined>>();
  const cellsSignals = new Map<SectionId, ReadonlySignal<readonly PoolCell[]>>();
  const rowCountSignals = new Map<SectionId, ReadonlySignal<number>>();
  const startRowSignals = new Map<SectionId, ReadonlySignal<number>>();

  let activeMeasurement: SduiContainerMeasurement | undefined;

  function getPoolSignal(poolId: PoolId): Signal<NormalizedPool | undefined> {
    let poolSignal = poolSignals.get(poolId);
    if (!poolSignal) {
      poolSignal = signal<NormalizedPool | undefined>(undefined);
      poolSignals.set(poolId, poolSignal);
    }
    return poolSignal;
  }

  function getSectionSignal(sectionId: SectionId): Signal<RegisteredPoolSection | undefined> {
    let sectionSignal = sectionSignals.get(sectionId);
    if (!sectionSignal) {
      sectionSignal = signal<RegisteredPoolSection | undefined>(undefined);
      sectionSignals.set(sectionId, sectionSignal);
    }
    return sectionSignal;
  }

  function getOrCreateColumnCountSignal(sectionId: SectionId): ReadonlySignal<number> {
    let columnCountSignal = columnCountSignals.get(sectionId);
    if (columnCountSignal) {
      return columnCountSignal;
    }

    columnCountSignal = computed(() => {
      const section = getSectionSignal(sectionId).value;
      if (!section?.poolId || !getPoolSignal(section.poolId).value) {
        return 0;
      }

      const columnCount =
        layoutSourceSignal.value?.resolveColumnCount(section.collectionItemSize) ?? 0;
      if (!Number.isFinite(columnCount) || !Number.isInteger(columnCount) || columnCount <= 0) {
        reportPoolIssue(options.errorReporter, options.pageContext, options.configKey, {
          reason: "invalidColumnCount",
          sectionId,
          poolId: section.poolId,
          columnCount,
        });
        return 0;
      }
      return columnCount;
    });

    columnCountSignals.set(sectionId, columnCountSignal);
    return columnCountSignal;
  }

  function getOrCreateAllocationSignal(
    sectionId: SectionId,
  ): ReadonlySignal<SectionAllocation | undefined> {
    let allocationSignal = allocationSignals.get(sectionId);
    if (allocationSignal) {
      return allocationSignal;
    }

    allocationSignal = computed(() => {
      const section = getSectionSignal(sectionId).value;
      if (!section?.poolId) {
        return undefined;
      }

      const pool = getPoolSignal(section.poolId).value;
      if (!pool) {
        return undefined;
      }

      try {
        let previousSectionId = section.previousPoolSectionId;
        let previousAllocation: SectionAllocation | undefined;
        // Keep checking earlier sections until we find the latest one that successfully allocated.
        // current -> previous (no allocation) -> previous (allocation found; stop)
        while (previousSectionId && !previousAllocation) {
          previousAllocation = getOrCreateAllocationSignal(previousSectionId).value;
          previousSectionId = getSectionSignal(previousSectionId).value?.previousPoolSectionId;
        }

        const columnCount = getOrCreateColumnCountSignal(sectionId).value;
        if (columnCount <= 0) {
          return undefined;
        }

        return allocateSection({
          pool,
          previousAllocation,
          columnCount,
          numberOfRows: section.numberOfRows,
        });
      } catch (error) {
        reportPoolIssue(options.errorReporter, options.pageContext, options.configKey, {
          reason: "allocationFailed",
          sectionId,
          poolId: section.poolId,
          error,
        });
        return undefined;
      }
    });
    allocationSignals.set(sectionId, allocationSignal);
    return allocationSignal;
  }

  function getOrCreateCellsSignal(sectionId: SectionId): ReadonlySignal<readonly PoolCell[]> {
    let cellsSignal = cellsSignals.get(sectionId);
    if (cellsSignal) {
      return cellsSignal;
    }

    cellsSignal = computedEqual(
      () => getOrCreateAllocationSignal(sectionId).value?.cells ?? EMPTY_POOL_CELLS,
      isPoolCellListEqual,
    );

    cellsSignals.set(sectionId, cellsSignal);

    return cellsSignal;
  }

  function getOrCreateRowCountSignal(sectionId: SectionId): ReadonlySignal<number> {
    let rowCountSignal = rowCountSignals.get(sectionId);
    if (rowCountSignal) {
      return rowCountSignal;
    }

    rowCountSignal = computed(() => {
      const section = getSectionSignal(sectionId).value;
      if (!section) {
        return 0;
      }

      if (section.numberOfRows !== -1) {
        return section.numberOfRows;
      }

      return getOrCreateAllocationSignal(sectionId).value?.actualRowCount ?? 0;
    });

    rowCountSignals.set(sectionId, rowCountSignal);

    return rowCountSignal;
  }

  function getOrCreateStartRowSignal(sectionId: SectionId): ReadonlySignal<number> {
    let startRowSignal = startRowSignals.get(sectionId);
    if (startRowSignal) {
      return startRowSignal;
    }

    startRowSignal = computed(() => {
      const section = getSectionSignal(sectionId).value;
      if (!section?.previousFeedSectionId) {
        return 1;
      }

      const previousSectionStartRow = getOrCreateStartRowSignal(
        section.previousFeedSectionId,
      ).value;
      const previousSectionRowCount = getOrCreateRowCountSignal(
        section.previousFeedSectionId,
      ).value;
      return previousSectionStartRow + previousSectionRowCount;
    });

    startRowSignals.set(sectionId, startRowSignal);
    return startRowSignal;
  }

  function getSectionCells(sectionId: SectionId): ReadonlySignal<readonly PoolCell[]> {
    return getOrCreateCellsSignal(sectionId);
  }

  function getSectionRowCount(sectionId: SectionId): ReadonlySignal<number> {
    return getOrCreateRowCountSignal(sectionId);
  }

  function getSectionStartRow(sectionId: SectionId): ReadonlySignal<number> {
    return getOrCreateStartRowSignal(sectionId);
  }

  function getSectionColumnCount(sectionId: SectionId): ReadonlySignal<number> {
    return getOrCreateColumnCountSignal(sectionId);
  }

  function getSectionPoolId(sectionId: SectionId): PoolId | undefined {
    return getSectionSignal(sectionId).peek()?.poolId;
  }

  function getLayoutSourceSignal(): ReadonlySignal<CollectionLayoutSource | undefined> {
    return layoutSourceSignal;
  }

  function applySnapshot(snapshot: PoolSnapshot): void {
    const registeredSections = registerSections(snapshot.sections);
    batch(() => {
      for (const [poolId, pool] of snapshot.pools ?? []) {
        getPoolSignal(poolId).value = pool;
      }
      for (const missingPoolId of snapshot.missingPoolIds ?? []) {
        getPoolSignal(missingPoolId).value = undefined;
      }
      for (const section of registeredSections) {
        getSectionSignal(section.sectionId).value = section;
      }
    });
  }

  function clear(): void {
    batch(() => {
      for (const poolSignal of poolSignals.values()) {
        poolSignal.value = undefined;
      }
      for (const sectionSignal of sectionSignals.values()) {
        sectionSignal.value = undefined;
      }
      activeMeasurement = undefined;
      layoutSourceSignal.value = undefined;
    });
  }

  return {
    applySnapshot,
    setFallbackLayoutSource(source) {
      layoutSourceSignal.value = source;
    },
    mountContainerMeasurement() {
      const measurement: SduiContainerMeasurement = {
        setWidth(width) {
          if (activeMeasurement !== measurement) return;
          layoutSourceSignal
            .peek()
            ?.setContainerWidth(isValidContainerWidth(width) ? width : initialContainerWidth);
        },
        release() {
          if (activeMeasurement !== measurement) return;
          activeMeasurement = undefined;
          layoutSourceSignal.peek()?.setContainerWidth(initialContainerWidth);
        },
      };
      activeMeasurement = measurement;
      return measurement;
    },
    getSectionPoolId,
    getLayoutSourceSignal,
    getSectionCells,
    getSectionRowCount,
    getSectionStartRow,
    getSectionColumnCount,
    clear,
  };
}
