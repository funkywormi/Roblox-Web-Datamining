import type { PoolSectionLayoutMetadata, SduiComponentConfig, SduiDim } from "../types";

const MEASUREMENT_EPSILON_PX = 0.5;
const MAX_IGNORED_GRID_WIDTH_CHANGE_PX = 20;

export function toPositiveGridMeasurement(value: number): number | undefined {
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function gridMeasurementChanged(
  previous: number | undefined,
  next: number | undefined,
): boolean {
  if (previous === undefined || next === undefined) return previous !== next;
  return Math.abs(previous - next) > MEASUREMENT_EPSILON_PX;
}

export function nextGridHeightBasisWidth(
  previousWidth: number | undefined,
  nextWidth: number | undefined,
): number | undefined {
  if (nextWidth === undefined) return previousWidth;
  if (
    previousWidth === undefined ||
    Math.abs(previousWidth - nextWidth) > MAX_IGNORED_GRID_WIDTH_CHANGE_PX
  ) {
    return nextWidth;
  }
  return previousWidth;
}

export function resolveGridCellWidth(
  gridWidth: number,
  columnCount: number,
  gap: number,
): number | undefined {
  if (
    !Number.isFinite(gridWidth) ||
    gridWidth <= 0 ||
    !Number.isFinite(columnCount) ||
    columnCount <= 0 ||
    !Number.isFinite(gap)
  ) {
    return undefined;
  }
  return (gridWidth - gap * (columnCount - 1)) / columnCount;
}

export function resolveGridRowHeightFromItemWidth(
  basisWidth: number,
  columnCount: number,
  gap: number,
  itemHeightFromWidth: SduiDim,
): number | undefined {
  const cellWidth = resolveGridCellWidth(basisWidth, columnCount, gap);
  if (
    cellWidth === undefined ||
    !Number.isFinite(itemHeightFromWidth.scale) ||
    !Number.isFinite(itemHeightFromWidth.offset)
  ) {
    return undefined;
  }

  const rowHeight = cellWidth * itemHeightFromWidth.scale + itemHeightFromWidth.offset;
  if (!Number.isFinite(rowHeight) || rowHeight <= 0) return undefined;
  return rowHeight;
}

export function capCollectionItemConfigs(
  configs: SduiComponentConfig[],
  columnCount: number,
  maxNumRows: number | undefined,
  poolLayout?: PoolSectionLayoutMetadata,
): SduiComponentConfig[] {
  if (maxNumRows === undefined || maxNumRows <= 0 || columnCount <= 0) {
    return configs;
  }

  if (!poolLayout) {
    const maximumItems = columnCount * maxNumRows;
    return configs.length <= maximumItems ? configs : configs.slice(0, maximumItems);
  }

  const visibleConfigs = configs.filter(config => {
    const cellIndex = config.poolPlacement?.cellIndex;
    return cellIndex !== undefined && Math.floor(cellIndex / columnCount) < maxNumRows;
  });
  return visibleConfigs.length === configs.length ? configs : visibleConfigs;
}
