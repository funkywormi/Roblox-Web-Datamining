"use client";

import React, { useEffect, useRef } from "react";

export interface LoadMoreSentinelProps {
  onLoadMore: () => void;
  /** Rebinds after a request updates the surface while the sentinel remains visible. */
  dataUpdatedTimestamp?: number;
  /** Starts loading this many pixels before the sentinel enters the viewport. */
  thresholdFromEnd?: number;
}

const normalizeThreshold = (thresholdFromEnd: number | undefined): number =>
  typeof thresholdFromEnd === "number" && Number.isFinite(thresholdFromEnd) && thresholdFromEnd > 0
    ? thresholdFromEnd
    : 0;

/**
 * Intersection sentinel used by feed/grid adapters.
 * It is not registry-backed because there is no corresponding SDUI schema.
 */
export function LoadMoreSentinel({
  onLoadMore,
  dataUpdatedTimestamp,
  thresholdFromEnd,
}: LoadMoreSentinelProps): React.JSX.Element {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;

    try {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0]?.isIntersecting) {
            onLoadMoreRef.current();
          }
        },
        {
          threshold: 0,
          rootMargin: `0px 0px ${normalizeThreshold(thresholdFromEnd)}px 0px`,
        },
      );
      observer.observe(sentinel);
      return () => {
        observer.disconnect();
      };
    } catch {
      return undefined;
    }
  }, [dataUpdatedTimestamp, thresholdFromEnd]);

  return (
    <div
      ref={sentinelRef}
      data-testid="load-more-sentinel"
      aria-hidden="true"
      style={{ width: "100%", height: 1, pointerEvents: "none" }}
    />
  );
}
