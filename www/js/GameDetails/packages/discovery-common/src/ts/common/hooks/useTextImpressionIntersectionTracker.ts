import { type RefObject, useEffect, useRef } from "react";
import { observeVisibility } from "@rbx/core-scripts/util/element-visibility";

type TextImpressionTrackerOptions = {
  onEmit: (threshold: number) => void;
  thresholds: number[];
  enabled?: boolean;
};

/**
 * This hook sends impression events for text element following:
 * 1. An event is sent for each threshold provided
 * 2. Each threshold fires onEmit individually when reached
 * 3. Each event only fires once
 *
 * @param textRef - The ref to the text element
 * @param options.onEmit - The function to call when a threshold is reached. Must
 * be memoized or defined as a module-level constant.
 * @param options.thresholds - The thresholds (0-1) to use for the intersection observer. Must
 * be memoized or defined as a module-level constant.
 * @param options.enabled - Whether the observer should be active. Defaults to true.
 */
const useTextImpressionIntersectionTracker = (
  textRef: RefObject<HTMLPreElement | HTMLDivElement>,
  options: TextImpressionTrackerOptions,
): void => {
  const { onEmit, thresholds, enabled = true } = options;

  const emittedThresholds = useRef(new Set<number>());

  useEffect(() => {
    if (!enabled || !textRef.current) {
      return undefined;
    }

    const disconnectFunctions: (VoidFunction | null)[] = thresholds.map(() => null);

    thresholds.forEach((threshold, index) => {
      disconnectFunctions[index] = observeVisibility(
        { element: textRef.current as HTMLElement, threshold },
        isVisible => {
          if (isVisible && !emittedThresholds.current.has(threshold)) {
            emittedThresholds.current.add(threshold);
            onEmit(threshold);
            disconnectFunctions[index]?.();
            disconnectFunctions[index] = null;
          }
        },
      );
    });

    return () => {
      disconnectFunctions.forEach(disconnect => disconnect?.());
    };
  }, [textRef, onEmit, thresholds, enabled]);
};

export default useTextImpressionIntersectionTracker;
