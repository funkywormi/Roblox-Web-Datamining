import { useState, useLayoutEffect, useMemo } from "react";
import { throttle } from "lodash";
import { useElementWidthResizeObserver } from "@rbx/discovery-sdui-components";
import { getNumTilesPerRow } from "../../common/components/GameTileUtils";
import { TComponentType } from "../../common/types/bedev2Types";

/**
 * Handle resize of grid element and update feed width and items per row CSS variables accordingly.
 */
const useGameSearchGridResize = (
  gridRef: React.RefObject<HTMLDivElement>,
  componentType: TComponentType | undefined,
): {
  searchFeedRef: (node: HTMLDivElement) => void;
} => {
  const [itemsPerRow, setItemsPerRow] = useState<number | undefined>(undefined);

  const [searchFeedRef, searchFeedWidth] = useElementWidthResizeObserver();

  useLayoutEffect(() => {
    const updateItemsPerRowThrottled = throttle((feedWidth: number) => {
      // Subtract one pixel buffer from searchFeedWidth due to Firefox calc() rounding issue
      const containerBufferWidth = 1;

      setItemsPerRow(getNumTilesPerRow(feedWidth, containerBufferWidth, componentType));
    }, 100);

    if (searchFeedWidth) {
      document.documentElement.style.setProperty("--home-feed-width", `${searchFeedWidth}px`);

      updateItemsPerRowThrottled(searchFeedWidth);
    }
  }, [searchFeedWidth, componentType]);

  // Update items per row CSS variable when itemsPerRow state variable changes
  useLayoutEffect(() => {
    if (itemsPerRow && gridRef?.current) {
      gridRef.current.style.setProperty("--items-per-row", itemsPerRow.toString());
    }
  }, [itemsPerRow, gridRef]);

  return useMemo(() => {
    return {
      searchFeedRef,
    };
  }, [searchFeedRef]);
};

export default useGameSearchGridResize;
