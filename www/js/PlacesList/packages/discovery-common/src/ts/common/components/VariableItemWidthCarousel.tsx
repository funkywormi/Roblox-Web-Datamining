import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { mergeRefs } from "react-merge-refs";
import classNames from "classnames";
import { throttle } from "es-toolkit";
import { gamesPage } from "../constants/configConstants";
import { debounce } from "../utils/helperUtils";
import ScrollArrows from "../../gamesPage/components/ScrollArrows";

type TVariableItemWidthCarouselProps<TItem> = {
  // Header props
  headerComponent?: React.ReactNode;

  // Ref that will be the direct parent of the items for impressions purposes
  itemsContainerRef: React.MutableRefObject<HTMLDivElement | null>;

  // Items to display
  items: TItem[];

  // Render item function
  renderItem: (item: TItem, index: number) => React.JSX.Element;

  // Function to get the key for each item
  getKey: (item: TItem, index: number) => string;

  // Class name defining the gap between items
  itemGapClassName?: string;

  // Whether to use new scroll arrows
  isNewScrollArrowsEnabled?: boolean;

  /** When false, hides scroll arrow controls but keeps horizontal scrolling. */
  scrollButtonsEnabled?: boolean;

  // Class name for the carousel container
  containerClassName?: string;

  /** Inline style applied to the scroll container (e.g. for dynamic gap override). */
  scrollContainerStyle?: React.CSSProperties;
};

const SCROLL_DEBOUNCE_MS = 100;
const SCROLL_THROTTLE_MS = 300;

/**
 * A carousel component that handles items with variable width.
 */
const VariableItemWidthCarousel = <TItem,>({
  headerComponent,
  itemsContainerRef,
  items,
  renderItem,
  getKey,
  itemGapClassName,
  isNewScrollArrowsEnabled,
  scrollButtonsEnabled = true,
  containerClassName,
  scrollContainerStyle,
}: TVariableItemWidthCarouselProps<TItem>): React.JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrollBackDisabled, setIsScrollBackDisabled] = useState(true);
  const [isScrollForwardDisabled, setIsScrollForwardDisabled] = useState(false);

  const updateScrollButtonStates = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      setIsScrollBackDisabled(true);
      setIsScrollForwardDisabled(true);
      return;
    }

    const maxScrollPosition = container.scrollWidth - container.clientWidth;
    const currentScrollPosition = container.scrollLeft;

    setIsScrollBackDisabled(currentScrollPosition <= 0);
    setIsScrollForwardDisabled(currentScrollPosition >= maxScrollPosition);
  }, []);

  const [debouncedScrollHandler, cancelDebounce] = useMemo(
    () => debounce(updateScrollButtonStates, SCROLL_DEBOUNCE_MS),
    [updateScrollButtonStates],
  );

  // Handle scroll events and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      updateScrollButtonStates();
    });

    container.addEventListener("scroll", debouncedScrollHandler);
    resizeObserver.observe(container);

    updateScrollButtonStates();

    return () => {
      if (container) {
        container.removeEventListener("scroll", debouncedScrollHandler);
      }
      resizeObserver.disconnect();
      cancelDebounce();
    };
  }, [updateScrollButtonStates, debouncedScrollHandler, cancelDebounce]);

  // Throttle scroll function to prevent rapid clicks during scroll animation
  const throttledScroll = useMemo(
    () =>
      throttle(
        (direction: number) => {
          const container = containerRef.current;
          if (!container) return;
          container.scrollBy({ left: direction * container.clientWidth, behavior: "smooth" });
        },
        SCROLL_THROTTLE_MS,
        { edges: ["leading"] },
      ),
    [],
  );

  // Clean up function
  useEffect(() => {
    return () => {
      throttledScroll.cancel();
    };
  }, [throttledScroll]);

  const onScrollBack = useCallback(() => {
    throttledScroll(-1);
  }, [throttledScroll]);

  const onScrollForward = useCallback(() => {
    throttledScroll(1);
  }, [throttledScroll]);

  const renderedItems = useMemo(() => {
    return items.map((item, index) => (
      <div key={getKey(item, index)} className="shrink-0" style={{ scrollSnapAlign: "start" }}>
        {renderItem(item, index)}
      </div>
    ));
  }, [items, renderItem, getKey]);

  const carouselContent = (
    <div className={classNames("relative", containerClassName)}>
      <div
        // Merge the ref used for scrolling with the ref used for impressions, which must be the direct parent of the items
        ref={mergeRefs([containerRef, itemsContainerRef])}
        data-testid="variable-item-width-scroll-container"
        className={classNames(
          itemGapClassName,
          "flex scroll-x [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [@media(pointer:coarse)_and_(not_(any-pointer:fine))]:[scroll-snap-type:none] [scrollbar-width:none]",
        )}
        style={{
          // When using old scroll arrows, offset snap points to account for arrow space
          // Remove when isNewScrollArrowsEnabled is always true
          scrollPaddingLeft: isNewScrollArrowsEnabled ? "0px" : `${gamesPage.scrollerWidth}px`,
          ...(scrollContainerStyle ?? {}),
        }}
      >
        {renderedItems}
      </div>
      {scrollButtonsEnabled ? (
        <ScrollArrows
          hideScrollBackWhenDisabled
          isScrollBackDisabled={isScrollBackDisabled}
          isScrollForwardDisabled={isScrollForwardDisabled}
          onScrollBack={onScrollBack}
          onScrollForward={onScrollForward}
          isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
        />
      ) : null}
    </div>
  );

  if (headerComponent) {
    return (
      <div className="flex flex-col">
        {headerComponent}
        {carouselContent}
      </div>
    );
  }

  return carouselContent;
};

export default VariableItemWidthCarousel;
