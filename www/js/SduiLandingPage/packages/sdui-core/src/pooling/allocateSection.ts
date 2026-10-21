import type { DeferredSpan, NormalizedPool, PoolCell, SectionAllocation } from "./types";
import { findNextFreeCellIndex, placeSpanAt } from "./gridPlacement";

/**
 * idea: create a class that handles the allocation of a section and has methods
 */
export interface AllocateSectionInput {
  readonly pool: NormalizedPool;
  readonly previousAllocation?: Pick<SectionAllocation, "nextPoolIndex"> & {
    readonly deferredSpans?: readonly DeferredSpan[];
  };
  readonly columnCount: number;
  readonly numberOfRows: number;
}

/**
 * If the previous allocation is not provided, returns 0.
 * If the previous allocation is provided, validates and returns its next pool index.
 * @param previousAllocation - The previous allocation.
 * @param poolLength - The length of the pool.
 * @returns The start pool index for the current section.
 */
function normalizeStartPoolIndex(
  previousAllocation: AllocateSectionInput["previousAllocation"],
  poolLength: number,
): number {
  const previousIndex = previousAllocation?.nextPoolIndex;
  if (previousIndex === undefined) {
    return 0;
  }
  if (!Number.isInteger(previousIndex) || previousIndex < 0 || previousIndex > poolLength) {
    throw new Error(`Invalid pool resume cursor: ${String(previousIndex)}`);
  }
  return previousIndex;
}

function createEmptyAllocation(
  nextPoolIndex: number,
  deferredSpans: readonly DeferredSpan[] = [],
): SectionAllocation {
  return {
    cells: [],
    actualRowCount: 0,
    nextPoolIndex,
    deferredSpans,
  };
}

/**
 * This method is used when the section only has trivial 1x1 cells with no
 * special layouts
 */
function allocateTrivialSection(
  pool: NormalizedPool,
  startPoolIndex: number,
  columnCount: number,
  numberOfRows: number,
): SectionAllocation {
  const isFillRemaining = numberOfRows === -1;
  const sectionCapacity = isFillRemaining ? Number.POSITIVE_INFINITY : columnCount * numberOfRows;
  const cells: PoolCell[] = [];
  let nextPoolIndex = startPoolIndex;

  // while we have items to add and the section is not full
  while (nextPoolIndex < pool.items.length && cells.length < sectionCapacity) {
    const poolIndex = nextPoolIndex;
    const item = pool.items[poolIndex];
    // Advance before skipping so malformed ranked slots cannot be retried by later sections.
    nextPoolIndex += 1;
    if (!item) continue;

    cells.push({
      kind: "item",
      item,
      poolIndex,
      cellIndex: cells.length,
    });
  }

  return {
    cells,
    actualRowCount: Math.ceil(cells.length / columnCount),
    nextPoolIndex,
    deferredSpans: [],
  };
}

/**
 * items:  [A, invalid, B, C]
 * counts: [3, 2,       2, 1, 0]
 */
function buildRemainingUsableItemCounts(pool: NormalizedPool): readonly number[] {
  const counts = new Array<number>(pool.items.length + 1).fill(0);
  for (let poolIndex = pool.items.length - 1; poolIndex >= 0; poolIndex -= 1) {
    const previousCount = counts[poolIndex + 1] ?? 0;
    const isCurrentItemValid = Boolean(pool.items[poolIndex]);
    counts[poolIndex] = previousCount + (isCurrentItemValid ? 1 : 0);
  }
  return counts;
}

/**
 * Allocates a section that contains spans.
 *
 * Spans are placed in three cases:
 * 1. Carried spans from the previous section are tried first.
 * 2. A span reached in the pool is tried immediately when nothing is deferred.
 * 3. After a 1x1 item is placed, deferred spans are retried in FIFO order.
 */
function allocateSpanAwareSection(
  pool: NormalizedPool,
  startPoolIndex: number,
  carriedSpans: readonly DeferredSpan[],
  columnCount: number,
  numberOfRows: number,
): SectionAllocation {
  const maxRows = numberOfRows === -1 ? undefined : numberOfRows;
  const occupiedCellIndexes = new Set<number>();
  const occupiedCellsByIndex = new Map<number, PoolCell>();
  const remainingUsableItemCounts = buildRemainingUsableItemCounts(pool);
  const deferredSpans: DeferredSpan[] = [];
  let nextPoolIndex = startPoolIndex;
  let nextScanCellIndex = 0;
  let minimumSpanAnchorRow = 0;

  // the anchor cell is the non-blank cell that is taken up when an item is
  // allocated. when a span takes up multiple cells in the grid (2x2 span takes up 4
  // cells). The anchor cell is the top left cell of the span.
  function findAnchorCellIndex(): number | undefined {
    return findNextFreeCellIndex(occupiedCellIndexes, nextScanCellIndex, {
      columnCount,
      maxRows,
    });
  }

  function commitSpan(deferredSpan: DeferredSpan): "placed" | "blocked" | "discarded" {
    const item = pool.items[deferredSpan.poolIndex];
    if (!item) {
      return "discarded";
    }

    const anchorCellIndex = findAnchorCellIndex();
    if (anchorCellIndex === undefined) {
      return "blocked";
    }

    const spanCells = placeSpanAt({
      anchorCellIndex,
      layout: deferredSpan.layout,
      occupiedCellIndexes,
      followingUsableItemCount: remainingUsableItemCounts[nextPoolIndex] ?? 0,
      minimumAnchorRow: minimumSpanAnchorRow,
      columnCount,
      maxRows,
      item,
      poolIndex: deferredSpan.poolIndex,
    });
    if (!spanCells) {
      return "blocked";
    }

    for (const cell of spanCells) {
      occupiedCellIndexes.add(cell.cellIndex);
      occupiedCellsByIndex.set(cell.cellIndex, cell);
    }

    const anchorRow = Math.floor(anchorCellIndex / columnCount);
    // If minRowPadding is not set (0), the next span can be allocated on the
    // last row of this span
    minimumSpanAnchorRow =
      anchorRow + deferredSpan.layout.rowSpan - 1 + deferredSpan.layout.minRowPadding;
    nextScanCellIndex = anchorCellIndex + deferredSpan.layout.colSpan;
    return "placed";
  }

  /**
   * Retries deferred spans in FIFO order until the first span is blocked.
   * Placed or discarded spans are removed from the queue.
   */
  function retryDeferredSpans(): void {
    while (deferredSpans.length > 0) {
      const deferredSpan = deferredSpans[0];
      if (!deferredSpan) {
        return;
      }

      const result = commitSpan(deferredSpan);
      if (result === "blocked") {
        return;
      }

      deferredSpans.shift();
    }
  }

  /**
   * When a section starts, first try to allocate the deferred spans from the
   * previous section.
   */
  for (const carriedSpan of carriedSpans) {
    // Spans must be allocated in order, so if there are already deferred spans,
    // we can short-circuit and just add it to the end of deferredSpans rather
    // than trying to place it first
    if (deferredSpans.length > 0) {
      deferredSpans.push(carriedSpan);
      continue;
    }

    const result = commitSpan(carriedSpan);
    if (result === "blocked") {
      deferredSpans.push(carriedSpan);
    }
  }

  while (nextPoolIndex < pool.items.length) {
    const anchorCellIndex = findAnchorCellIndex();
    if (anchorCellIndex === undefined) break;

    const poolIndex = nextPoolIndex;
    const item = pool.items[poolIndex];
    nextPoolIndex += 1;
    if (!item) {
      continue;
    }

    const layout = pool.layouts?.get(poolIndex);
    if (layout) {
      const deferredSpan = { poolIndex, layout };
      if (deferredSpans.length > 0) {
        // spans must be allocated in FIFO order, so if there are already deferred spans,
        // we can short-circuit and just add it to the end of deferredSpans rather
        // than trying to place it first
        deferredSpans.push(deferredSpan);
        continue;
      }

      const result = commitSpan(deferredSpan);
      if (result === "blocked") {
        deferredSpans.push(deferredSpan);
      }
    } else {
      const cell: PoolCell = {
        kind: "item",
        item,
        poolIndex,
        cellIndex: anchorCellIndex,
      };
      occupiedCellIndexes.add(anchorCellIndex);
      occupiedCellsByIndex.set(anchorCellIndex, cell);
      nextScanCellIndex = anchorCellIndex + 1;
      retryDeferredSpans();
    }
  }

  // Spans can insert cells out of order, so we need to sort the cells by their index.
  const cells = [...occupiedCellsByIndex.values()].sort(
    (left, right) => left.cellIndex - right.cellIndex,
  );
  const lastCell = cells.at(-1);
  const actualRowCount = lastCell
    ? // Convert the 0-based last cell index to a cell count before calculating the row count.
      // Note: we use lastCell.cellIndex instead of cells.length because cells.length
      // records the number of occupied cells whereas cellIndex records the
      // furthest position in the grid that was allocated. In normal cases where
      // the entire section is filled, this distinction doesn't matter, but this
      // handles edge cases where the section has gaps
      Math.ceil((lastCell.cellIndex + 1) / columnCount)
    : 0;

  return {
    cells,
    actualRowCount,
    nextPoolIndex,
    deferredSpans,
  };
}

export function allocateSection({
  pool,
  previousAllocation,
  columnCount,
  numberOfRows,
}: AllocateSectionInput): SectionAllocation {
  const startPoolIndex = normalizeStartPoolIndex(previousAllocation, pool.items.length);
  const hasValidColumns = Number.isInteger(columnCount) && columnCount > 0;
  // -1 is valid because it means "fill remaining"
  const hasValidRows = numberOfRows === -1 || (Number.isInteger(numberOfRows) && numberOfRows > 0);
  const deferredSpans = previousAllocation?.deferredSpans ?? [];

  if (!hasValidColumns || !hasValidRows) {
    return createEmptyAllocation(startPoolIndex, deferredSpans);
  }

  return (pool.layouts && pool.layouts.size > 0) || deferredSpans.length > 0
    ? allocateSpanAwareSection(pool, startPoolIndex, deferredSpans, columnCount, numberOfRows)
    : allocateTrivialSection(pool, startPoolIndex, columnCount, numberOfRows);
}
