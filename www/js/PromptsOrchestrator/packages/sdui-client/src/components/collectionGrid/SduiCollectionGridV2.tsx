"use client";

import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import {
  resolveCollectionColumnCount,
  resolveCollectionColumnGap,
  type PoolItemPlacementMetadata,
  type PoolSectionLayoutMetadata,
  type SduiComponentConfig,
  type SduiDim,
  type SduiManagedChildList,
} from "@rbx/sdui-core";

const MEASUREMENT_EPSILON_PX = 0.5;
const MAX_IGNORED_GRID_WIDTH_CHANGE_PX = 20;
const STANDARD_COLLECTION_ITEM_SIZE = "Small";

export interface SduiCollectionGridV2Props {
  items?: SduiManagedChildList;
  itemsContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  itemConfigs: SduiComponentConfig[];
  renderItem: (
    config: SduiComponentConfig,
    index: number,
    isVisible?: boolean,
  ) => React.JSX.Element;
  headerComponent?: React.ReactNode;
  gapBetweenHeaderAndItems: React.CSSProperties["gap"];
  collectionItemSize?: string;
  itemHeightFromWidth?: SduiDim;
  maxNumRows?: number;
  onItemsPerRowChange: (itemsPerRow: number) => void;
}

function positiveFiniteMeasurement(value: number): number | undefined {
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function measurementChanged(previous: number | undefined, next: number | undefined): boolean {
  if (previous === undefined || next === undefined) return previous !== next;
  return Math.abs(previous - next) > MEASUREMENT_EPSILON_PX;
}

export interface GridItemHeight {
  naturalHeight: number;
  rowSpan: number;
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

export function resolveGridRowHeightFromItemWidth(
  basisWidth: number,
  columnCount: number,
  gap: number,
  itemHeightFromWidth: SduiDim,
): number | undefined {
  if (
    !Number.isFinite(basisWidth) ||
    basisWidth <= 0 ||
    !Number.isFinite(columnCount) ||
    columnCount <= 0 ||
    !Number.isFinite(gap) ||
    !Number.isFinite(itemHeightFromWidth.scale) ||
    !Number.isFinite(itemHeightFromWidth.offset)
  ) {
    return undefined;
  }

  const cellWidth = (basisWidth - gap * (columnCount - 1)) / columnCount;
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

export function resolveGridRowHeight(
  itemHeights: readonly GridItemHeight[],
  verticalGap: number,
): number | undefined {
  let rowHeight: number | undefined;
  for (const { naturalHeight, rowSpan } of itemHeights) {
    if (
      !Number.isFinite(naturalHeight) ||
      !Number.isFinite(rowSpan) ||
      naturalHeight <= 0 ||
      rowSpan <= 0
    ) {
      continue;
    }
    const candidate = (naturalHeight - verticalGap * (rowSpan - 1)) / rowSpan;
    if (Number.isFinite(candidate) && candidate > 0) {
      rowHeight = Math.max(rowHeight ?? 0, candidate);
    }
  }
  return rowHeight;
}

interface SduiCollectionGridCellProps {
  columnCount: number;
  index: number;
  placement?: PoolItemPlacementMetadata;
  children: React.ReactNode;
}

const SduiCollectionGridCell = forwardRef<HTMLDivElement, SduiCollectionGridCellProps>(
  ({ columnCount, index, placement, children }, ref) => {
    const style =
      placement && columnCount > 0
        ? {
            gridColumn: `${(placement.cellIndex % columnCount) + 1} / span ${
              placement.span?.colSpan ?? 1
            }`,
            gridRow: `${Math.floor(placement.cellIndex / columnCount) + 1} / span ${
              placement.span?.rowSpan ?? 1
            }`,
          }
        : undefined;

    return (
      <div
        data-testid={`sdui-grid-cell-${placement?.poolIndex ?? index}`}
        className="min-width-0"
        style={style}
      >
        <div
          ref={ref}
          data-testid={`sdui-grid-measure-${placement?.poolIndex ?? index}`}
          className="width-full height-fit"
        >
          {children}
        </div>
      </div>
    );
  },
);
SduiCollectionGridCell.displayName = "SduiCollectionGridCell";

export function SduiCollectionGridV2({
  items,
  itemsContainerRef,
  itemConfigs,
  renderItem,
  headerComponent,
  gapBetweenHeaderAndItems,
  collectionItemSize = STANDARD_COLLECTION_ITEM_SIZE,
  itemHeightFromWidth,
  maxNumRows,
  onItemsPerRowChange,
}: SduiCollectionGridV2Props): React.JSX.Element {
  const poolLayout = items?.poolLayout;
  const isPooled = poolLayout !== undefined;
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
  const [heightBasisWidth, setHeightBasisWidth] = useState<number | undefined>(undefined);
  const [measurementVersion, setMeasurementVersion] = useState(0);
  const [rowHeight, setRowHeight] = useState<number | undefined>(undefined);
  const itemMeasurementElements = useRef(new Map<number, HTMLDivElement>());
  const lastPositiveGridWidth = useRef<number | undefined>(undefined);
  const lastMeasuredItemHeights = useRef(new Map<number, number>());
  const columnCount =
    poolLayout?.columnCount ?? resolveCollectionColumnCount(collectionItemSize, containerWidth);
  const gap = resolveCollectionColumnGap(containerWidth);
  const visibleItemConfigs = useMemo(
    () => capCollectionItemConfigs(itemConfigs, columnCount, maxNumRows, poolLayout),
    [columnCount, itemConfigs, maxNumRows, poolLayout],
  );
  const isItemHeightFromWidthApplied =
    itemHeightFromWidth !== undefined &&
    containerWidth !== undefined &&
    containerWidth > 0 &&
    heightBasisWidth !== undefined &&
    columnCount > 0;
  const rowHeightFromItemWidth = isItemHeightFromWidthApplied
    ? resolveGridRowHeightFromItemWidth(heightBasisWidth, columnCount, gap, itemHeightFromWidth)
    : undefined;

  useEffect(() => {
    onItemsPerRowChange(columnCount);
  }, [columnCount, onItemsPerRowChange]);

  useEffect(() => {
    const gridElement = itemsContainerRef.current;
    if (!gridElement) return undefined;

    const updateGridWidth = (width: number): boolean => {
      const nextWidth = positiveFiniteMeasurement(width);
      if (!measurementChanged(lastPositiveGridWidth.current, nextWidth)) return false;
      lastPositiveGridWidth.current = nextWidth;
      setContainerWidth(nextWidth);
      setHeightBasisWidth(previousWidth => nextGridHeightBasisWidth(previousWidth, nextWidth));
      if (!isItemHeightFromWidthApplied) setRowHeight(undefined);
      return true;
    };
    updateGridWidth(gridElement.getBoundingClientRect().width);

    const ResizeObserverConstructor = browserWindow?.ResizeObserver;
    if (!ResizeObserverConstructor) return undefined;

    const resizeObserver = new ResizeObserverConstructor(entries => {
      let itemHeightChanged = false;
      for (const entry of entries) {
        if (entry.target === gridElement) {
          updateGridWidth(entry.contentRect.width);
          continue;
        }
        if (!isPooled || isItemHeightFromWidthApplied) continue;

        for (const [index, measurementElement] of itemMeasurementElements.current) {
          if (entry.target !== measurementElement) continue;
          const nextHeight = positiveFiniteMeasurement(entry.contentRect.height);
          const previousHeight = lastMeasuredItemHeights.current.get(index);
          if (measurementChanged(previousHeight, nextHeight)) {
            if (nextHeight === undefined) {
              lastMeasuredItemHeights.current.delete(index);
            } else {
              lastMeasuredItemHeights.current.set(index, nextHeight);
            }
            itemHeightChanged = true;
          }
          break;
        }
      }
      if (itemHeightChanged) setMeasurementVersion(version => version + 1);
    });
    resizeObserver.observe(gridElement);
    if (isPooled && !isItemHeightFromWidthApplied) {
      for (const measurementElement of itemMeasurementElements.current.values()) {
        resizeObserver.observe(measurementElement);
      }
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [isItemHeightFromWidthApplied, isPooled, itemsContainerRef, visibleItemConfigs]);

  useEffect(() => {
    if (!isPooled || isItemHeightFromWidthApplied) {
      setRowHeight(undefined);
      return;
    }
    if (containerWidth === undefined) {
      setRowHeight(undefined);
      return;
    }

    const itemHeights: GridItemHeight[] = [];
    const measuredHeights = new Map<number, number>();
    visibleItemConfigs.forEach((config, index) => {
      const measurementElement = itemMeasurementElements.current.get(index);
      if (!measurementElement) return;
      const naturalHeight = measurementElement.getBoundingClientRect().height;
      itemHeights.push({
        naturalHeight,
        rowSpan: config.poolPlacement?.span?.rowSpan ?? 1,
      });
      measuredHeights.set(index, naturalHeight);
    });
    lastMeasuredItemHeights.current = measuredHeights;
    setRowHeight(resolveGridRowHeight(itemHeights, gap));
  }, [
    containerWidth,
    gap,
    isItemHeightFromWidthApplied,
    isPooled,
    measurementVersion,
    visibleItemConfigs,
  ]);

  let gridAutoRows = "auto";
  if (isItemHeightFromWidthApplied && rowHeightFromItemWidth !== undefined) {
    gridAutoRows = `${rowHeightFromItemWidth}px`;
  } else if (isPooled && rowHeight !== undefined && rowHeight > 0) {
    gridAutoRows = `${rowHeight}px`;
  }

  return (
    <div
      data-testid="sdui-collection-grid-v2-container"
      className="flex flex-col"
      style={headerComponent == null ? undefined : { gap: gapBetweenHeaderAndItems }}
    >
      {headerComponent}
      <div
        ref={itemsContainerRef}
        data-testid="sdui-collection-grid-v2"
        className="grid"
        style={{
          gridTemplateColumns: columnCount > 0 ? `repeat(${columnCount}, minmax(0, 1fr))` : "none",
          gridAutoRows,
          gap: `${gap}px`,
        }}
      >
        {visibleItemConfigs.map((config, index) => {
          const placement = config.poolPlacement;
          if (isPooled && !placement) return null;

          const key =
            config.reactKey ??
            config.identifier ??
            (isPooled && placement ? `pool-${placement.poolIndex}` : `item-${index}`);
          return (
            <SduiCollectionGridCell
              key={key}
              ref={element => {
                if (element) {
                  itemMeasurementElements.current.set(index, element);
                } else {
                  itemMeasurementElements.current.delete(index);
                }
              }}
              columnCount={columnCount}
              index={index}
              placement={isPooled ? placement : undefined}
            >
              {renderItem(config, index, true)}
            </SduiCollectionGridCell>
          );
        })}
      </div>
    </div>
  );
}
