import { RefObject, useEffect, useRef } from "react";

export type UseInfiniteScrollOptions = {
  /** Whether there are more pages to load. When false, no observer is attached. */
  hasMore: boolean;
  /** Whether a page is currently loading. While true, no observer is attached so a
   * single scroll-to-end cannot trigger overlapping loads. */
  isLoading: boolean;
  /** Called once each time the sentinel scrolls into view (and hasMore && !isLoading). */
  onLoadMore: () => void;
  /** The scroll container the sentinel is measured against (the IntersectionObserver
   * root). Pass a ref to the scrolling element; null falls back to the viewport. */
  rootRef: RefObject<HTMLElement | null>;
  /** Pre-fetch distance before the sentinel is actually visible. Defaults to '120px'. */
  rootMargin?: string;
};

/**
 * Infinite-scroll primitive replacing the legacy `lazyLoadingDirective.js`
 * (mCustomScrollbar). Item-agnostic: it only observes a sentinel element and calls
 * `onLoadMore` when that sentinel enters the scroll container — it knows nothing about
 * what the list renders. Attach the returned ref to a sentinel placed after the last
 * row (render it only while `hasMore`).
 */
export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  rootRef,
  rootMargin = "120px",
}: UseInfiniteScrollOptions): RefObject<HTMLDivElement> => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Hold the latest callback so a changing onLoadMore identity does not tear down and
  // re-create the observer on every render.
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) {
      return undefined;
    }
    if (typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      { root: rootRef.current ?? null, rootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, rootRef, rootMargin]);

  return sentinelRef;
};

export default useInfiniteScroll;
