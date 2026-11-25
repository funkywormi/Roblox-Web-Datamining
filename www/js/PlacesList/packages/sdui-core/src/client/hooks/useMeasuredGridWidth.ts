import { useEffect, useRef, useState, type RefObject } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import {
  gridMeasurementChanged,
  nextGridHeightBasisWidth,
  toPositiveGridMeasurement,
} from "../../pooling/collectionGridLayout";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface MeasuredGridWidth {
  gridWidth: number | undefined;
  heightBasisWidth: number | undefined;
}

const UNMEASURED: MeasuredGridWidth = { gridWidth: undefined, heightBasisWidth: undefined };

type ObservedGrid = {
  element: HTMLElement;
  disconnect: () => void;
};

export function useMeasuredGridWidth(gridRef: RefObject<HTMLElement | null>): MeasuredGridWidth {
  const [measurement, setMeasurement] = useState<MeasuredGridWidth>(UNMEASURED);
  const latestMeasurement = useRef(measurement);
  const observedGrid = useRef<ObservedGrid | undefined>(undefined);

  // gridRef's identity never changes, so a dependency array cannot see when
  // .current moves to another element (the grid mounts late, or a later render
  // swaps the node). Re-check every commit and return when the element is the same.
  //
  // Cleanup lives on the mount-only effect below. A cleanup here would run before
  // every commit and disconnect the observer even when the element did not change.
  useIsomorphicLayoutEffect(() => {
    const gridElement = gridRef.current;
    if (observedGrid.current?.element === gridElement) return;

    observedGrid.current?.disconnect();
    observedGrid.current = undefined;
    if (!gridElement) return;

    const updateGridWidth = (width: number): void => {
      const previous = latestMeasurement.current;
      const nextWidth = toPositiveGridMeasurement(width);
      if (!gridMeasurementChanged(previous.gridWidth, nextWidth)) return;
      latestMeasurement.current = {
        gridWidth: nextWidth,
        heightBasisWidth: nextGridHeightBasisWidth(previous.heightBasisWidth, nextWidth),
      };
      setMeasurement(latestMeasurement.current);
    };
    updateGridWidth(gridElement.getBoundingClientRect().width);

    const ResizeObserverConstructor = browserWindow?.ResizeObserver;
    if (!ResizeObserverConstructor) {
      observedGrid.current = { element: gridElement, disconnect: () => undefined };
      return;
    }

    const resizeObserver = new ResizeObserverConstructor(entries => {
      for (const entry of entries) {
        if (entry.target === gridElement) updateGridWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(gridElement);
    observedGrid.current = {
      element: gridElement,
      disconnect: () => {
        resizeObserver.disconnect();
      },
    };
  });

  useEffect(
    () => () => {
      observedGrid.current?.disconnect();
      observedGrid.current = undefined;
    },
    [],
  );

  return measurement;
}
