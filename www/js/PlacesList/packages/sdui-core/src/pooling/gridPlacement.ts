import { PoolItemAlignment } from "./poolItemAlignment";
import type { ItemLayout, PoolCell, PoolItem } from "./types";

export interface GridBounds {
  readonly columnCount: number;
  readonly maxRows?: number;
}

export interface SpanFitInput extends GridBounds {
  readonly anchorCellIndex: number;
  readonly layout: ItemLayout;
  readonly occupiedCellIndexes: ReadonlySet<number>;
  readonly followingUsableItemCount: number;
  readonly minimumAnchorRow?: number;
}

export interface PlaceSpanInput extends SpanFitInput {
  readonly item: PoolItem;
  readonly poolIndex: number;
}

export function findNextFreeCellIndex(
  occupiedCellIndexes: ReadonlySet<number>,
  startCellIndex: number,
  { columnCount, maxRows }: GridBounds,
): number | undefined {
  if (!Number.isInteger(columnCount) || columnCount <= 0) {
    return undefined;
  }

  if (maxRows !== undefined && (!Number.isInteger(maxRows) || maxRows <= 0)) {
    return undefined;
  }

  const maxCellCount = maxRows === undefined ? undefined : columnCount * maxRows;
  let cellIndex = Number.isInteger(startCellIndex) && startCellIndex > 0 ? startCellIndex : 0;

  while (occupiedCellIndexes.has(cellIndex)) {
    cellIndex += 1;
  }
  return maxCellCount === undefined || cellIndex < maxCellCount ? cellIndex : undefined;
}

/**
 * Example inputs:
 *
 *     anchorCellIndex = 1
 *     columnCount = 4
 *     layout.rowSpan = 2
 *     layout.colSpan = 2
 *
 * The grid is flattened left-to-right:
 *
 *                         4 columns per row
 *                   ┌─────┬─────┬─────┬─────┐
 *     rowOffset 0   │  0  │  1  │  2  │  3  │
 *                   │     │  A  │  X  │     │
 *                   ├─────┼─────┼─────┼─────┤
 *     rowOffset 1   │  4  │  5  │  6  │  7  │
 *                   │     │  X  │  X  │     │
 *                   └─────┴─────┴─────┴─────┘
 *
 *     A = anchor
 *     X = another cell covered by the 2×2 span
 *     Result = [1, 2, 5, 6]
 *
 * Each index comes from:
 *
 *     anchor + rowOffset × columnCount + columnOffset
 *        1   + rowOffset ×      4      + columnOffset
 *
 *     rowOffset  columnOffset  calculation       index
 *         0           0        1 + 0×4 + 0   =     1
 *         0           1        1 + 0×4 + 1   =     2
 *         1           0        1 + 1×4 + 0   =     5
 *         1           1        1 + 1×4 + 1   =     6
 *
 * Visually:
 *
 *     Start at anchor 1
 *
 *     Move right one cell:  +1    → 2
 *     Move down one row:    +4    → 5
 *     Move down and right:  +4 +1 → 6
 *
 * The outer loop moves down rows (`rowOffset × columnCount`), while the inner
 * loop moves right across columns (`columnOffset`).
 */
export function getSpanCellIndexes(
  anchorCellIndex: number,
  layout: ItemLayout,
  columnCount: number,
): readonly number[] {
  const indexes: number[] = [];
  for (let rowOffset = 0; rowOffset < layout.rowSpan; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < layout.colSpan; columnOffset += 1) {
      indexes.push(anchorCellIndex + rowOffset * columnCount + columnOffset);
    }
  }
  return indexes;
}

export function canPlaceSpanAt({
  anchorCellIndex,
  layout,
  occupiedCellIndexes,
  followingUsableItemCount,
  minimumAnchorRow = 0,
  columnCount,
  maxRows,
}: SpanFitInput): boolean {
  if (
    !Number.isInteger(anchorCellIndex) ||
    anchorCellIndex < 0 ||
    !Number.isInteger(columnCount) ||
    columnCount <= 0 ||
    !Number.isInteger(layout.colSpan) ||
    layout.colSpan <= 0 ||
    !Number.isInteger(layout.rowSpan) ||
    layout.rowSpan <= 0
  ) {
    return false;
  }
  // logic like this is repeated a lot, maybe a helper function?
  if (maxRows !== undefined && (!Number.isInteger(maxRows) || maxRows <= 0)) return false;

  const anchorRow = Math.floor(anchorCellIndex / columnCount);
  if (anchorRow < minimumAnchorRow) {
    return false;
  }

  const anchorColumn = anchorCellIndex % columnCount;
  const doesSpanOverflowRowWidth = anchorColumn + layout.colSpan > columnCount;
  if (doesSpanOverflowRowWidth) {
    return false;
  }

  const doesSpanOverflowSectionHeight =
    maxRows !== undefined && anchorRow + layout.rowSpan > maxRows;
  if (doesSpanOverflowSectionHeight) {
    return false;
  }

  const isFirstColumn = anchorColumn === 0;
  if (layout.alignmentType === PoolItemAlignment.LeftPin && !isFirstColumn) {
    return false;
  }

  const doesSpanAlignWithRightEdge = anchorColumn + layout.colSpan === columnCount;
  if (layout.alignmentType === PoolItemAlignment.RightPin && !doesSpanAlignWithRightEdge) {
    return false;
  }

  const hasInsufficientTrailingItems = followingUsableItemCount < anchorColumn;
  if (layout.rowSpan > 1 && hasInsufficientTrailingItems) {
    return false;
  }

  // getSpanCellIndexes seems to be called at multiple places. should that
  // result be passed around isntead?
  return getSpanCellIndexes(anchorCellIndex, layout, columnCount).every(
    cellIndex => !occupiedCellIndexes.has(cellIndex),
  );
}

export function placeSpanAt(input: PlaceSpanInput): readonly PoolCell[] | undefined {
  if (!canPlaceSpanAt(input)) return undefined;

  return getSpanCellIndexes(input.anchorCellIndex, input.layout, input.columnCount).map(
    cellIndex =>
      cellIndex === input.anchorCellIndex
        ? {
            kind: "item",
            item: input.item,
            poolIndex: input.poolIndex,
            cellIndex,
            span: input.layout,
          }
        : {
            kind: "blank",
            cellIndex,
          },
  );
}
