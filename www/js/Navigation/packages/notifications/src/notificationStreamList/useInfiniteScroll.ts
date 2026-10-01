import { RefObject, useEffect, useRef } from "react";

// lazyLoadingDirective.js onTotalScrollOffset
const BOTTOM_OFFSET_PX = 100;

export type UseInfiniteScrollOptions = {
  /** Whether there are more pages to load. */
  hasMore: boolean;
  /** Whether a page is currently loading. A scroll that reaches the bottom meanwhile loads nothing. */
  isLoading: boolean;
  /** Called when a scroll brings the bottom of the list within reach. */
  onLoadMore: () => void;
  /** The scroll container. */
  rootRef: RefObject<HTMLElement | null>;
  /** Rows currently rendered. The root mounts late, so the listener re-attaches when this changes. */
  itemCount?: number;
};

/** Calls `onLoadMore` once each time a user scroll arrives within 100px of the bottom. */
export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  rootRef,
  itemCount = 0,
}: UseInfiniteScrollOptions): void => {
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;
  const atBottomRef = useRef(false);
  const measuredRootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }
    if (root !== measuredRootRef.current) {
      measuredRootRef.current = root;
      atBottomRef.current = false;
    }
    const onScroll = () => {
      const atBottom = root.scrollHeight - root.scrollTop - root.clientHeight <= BOTTOM_OFFSET_PX;
      const arrived = atBottom && !atBottomRef.current;
      atBottomRef.current = atBottom;
      if (arrived && hasMoreRef.current && !isLoadingRef.current) {
        onLoadMoreRef.current();
      }
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [rootRef, itemCount]);
};

export default useInfiniteScroll;
