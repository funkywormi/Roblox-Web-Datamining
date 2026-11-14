"use client";

import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import {
  capCollectionItemConfigs,
  gridMeasurementChanged,
  resolveCollectionColumnCount,
  resolveCollectionColumnGap,
  resolveGridRowHeightFromItemWidth,
  toPositiveGridMeasurement,
  type PoolItemPlacementMetadata,
  type SduiComponentConfig,
  type SduiDim,
  type SduiManagedChildList,
} from "@rbx/sdui-core";
import { useIsomorphicLayoutEffect, useMeasuredGridWidth } from "@rbx/sdui-core/client";

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

export interface GridItemHeight {
  naturalHeight: number;
  rowSpan: number;
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
  const { gridWidth: containerWidth, heightBasisWidth } = useMeasuredGridWidth(itemsContainerRef);
  const [measurementVersion, setMeasurementVersion] = useState(0);
  const [rowHeight, setRowHeight] = useState<number | undefined>(undefined);
  const itemMeasurementElements = useRef(new Map<number, HTMLDivElement>());
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

  useIsomorphicLayoutEffect(() => {
    onItemsPerRowChange(columnCount);
  }, [columnCount, onItemsPerRowChange]);

  useEffect(() => {
    const ResizeObserverConstructor = browserWindow?.ResizeObserver;
    if (!isPooled || isItemHeightFromWidthApplied || !ResizeObserverConstructor) return undefined;

    const resizeObserver = new ResizeObserverConstructor(entries => {
      let itemHeightChanged = false;
      for (const entry of entries) {
        for (const [index, measurementElement] of itemMeasurementElements.current) {
          if (entry.target !== measurementElement) continue;
          const nextHeight = toPositiveGridMeasurement(entry.contentRect.height);
          const previousHeight = lastMeasuredItemHeights.current.get(index);
          if (gridMeasurementChanged(previousHeight, nextHeight)) {
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
    for (const measurementElement of itemMeasurementElements.current.values()) {
      resizeObserver.observe(measurementElement);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [isItemHeightFromWidthApplied, isPooled, visibleItemConfigs]);

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
