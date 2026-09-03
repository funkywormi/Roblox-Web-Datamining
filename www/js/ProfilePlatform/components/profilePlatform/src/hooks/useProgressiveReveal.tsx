import { useCallback, useEffect, useState } from "react";

// Client-side progressive reveal: render `visibleCount` items, grow by `step` when the sentinel
// scrolls into view. Mirrors the legacy Angular grid's `visibleItems`/`loadMore()` behavior — the
// profile-platform Experiences component returns the full (capped) list at once, so there is no
// server pagination to consume.
const useProgressiveReveal = (
  total: number,
  initial: number,
  step: number,
): { visibleCount: number; sentinelRef: (node: HTMLLIElement | null) => void } => {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(initial, total));
  // State-backed callback ref: the sentinel mounts only after the slideshow->grid toggle, so the
  // observer effect must re-run when the node appears; a plain useRef never retriggers it.
  const [sentinel, setSentinel] = useState<HTMLLIElement | null>(null);
  const sentinelRef = useCallback((node: HTMLLIElement | null) => {
    setSentinel(node);
  }, []);

  useEffect(() => {
    if (!sentinel || visibleCount >= total || typeof IntersectionObserver === "undefined") {
      return undefined;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisibleCount(prev => Math.min(prev + step, total));
      }
    });
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [sentinel, visibleCount, total, step]);

  return { visibleCount, sentinelRef };
};

export default useProgressiveReveal;
