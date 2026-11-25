import { SDUI_FEED_ITEM_INDEX_ATTRIBUTE } from "@rbx/sdui-common";

const HALF_VISIBLE_THRESHOLD = 0.5;
const TALL_SECTION_ROOT_MARGIN = "-50% 0px -49% 0px";
const TALL_SECTION_VIEWPORT_MULTIPLE = 2;

type BoxSize = { width: number; height: number };

export type WatchFeedItemVisibilityOptions = {
  feedColumn: HTMLElement;
  isIndexTracked: (index: number) => boolean;
  onFeedItemVisible: (index: number) => void;
  onInvalidIndexMarker: () => void;
};

/** Reads the index from the marker, including negative numbers. Returns undefined when it is missing or not a whole number. */
function parseFeedItemIndex(element: Element | null): number | undefined {
  const rawIndex = element?.getAttribute(SDUI_FEED_ITEM_INDEX_ATTRIBUTE);
  if (rawIndex == null) {
    return undefined;
  }
  const index = Number(rawIndex);
  return Number.isInteger(index) ? index : undefined;
}

function isZeroArea(rect: BoxSize | null): boolean {
  return rect != null && (rect.width <= 0 || rect.height <= 0);
}

function isTallerThanTwiceTheViewport(rect: BoxSize): boolean {
  const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
  return rect.height > viewportHeight * TALL_SECTION_VIEWPORT_MULTIPLE;
}

/**
 * Watches the content inside each feed.
 * Call the returned function to stop watching.
 * A section counts as seen when half of it is on screen.
 * A section taller than twice the screen counts as seen when it crosses the middle of the screen.
 */
export function watchFeedItemVisibility({
  feedColumn,
  isIndexTracked,
  onFeedItemVisible,
  onInvalidIndexMarker,
}: WatchFeedItemVisibilityOptions): () => void {
  const observedRoots = new Set<Element>();
  const resizeObservers = new Map<Element, ResizeObserver>();

  const sectionObservers: {
    standard?: IntersectionObserver;
    tall?: IntersectionObserver;
  } = {};

  const stopObserving = (element: Element) => {
    sectionObservers.standard?.unobserve(element);
    sectionObservers.tall?.unobserve(element);
    observedRoots.delete(element);
    resizeObservers.get(element)?.disconnect();
    resizeObservers.delete(element);
  };

  const observeRoot = (sectionRoot: Element) => {
    if (observedRoots.has(sectionRoot)) {
      return;
    }
    observedRoots.add(sectionRoot);
    sectionObservers.standard?.observe(sectionRoot);
    sectionObservers.tall?.observe(sectionRoot);
  };

  const reobserveWhenSized = (sectionRoot: Element) => {
    if (resizeObservers.has(sectionRoot) || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(entries => {
      const resized = entries.find(entry => entry.target === sectionRoot);
      if (resized == null || isZeroArea(resized.contentRect)) {
        return;
      }
      resizeObserver.disconnect();
      resizeObservers.delete(sectionRoot);
      sectionObservers.standard?.unobserve(sectionRoot);
      sectionObservers.tall?.unobserve(sectionRoot);
      sectionObservers.standard?.observe(sectionRoot);
      sectionObservers.tall?.observe(sectionRoot);
    });
    resizeObservers.set(sectionRoot, resizeObserver);
    resizeObserver.observe(sectionRoot);
  };

  const stopObservingSentinel = (sentinel: Element | null) => {
    [...(sentinel?.children ?? [])].forEach(stopObserving);
  };

  const recordVisibleEntry = (entry: IntersectionObserverEntry) => {
    const sectionRoot = entry.target;
    const index = parseFeedItemIndex(sectionRoot.parentElement);
    if (index == null || index < 0) {
      onInvalidIndexMarker();
      stopObserving(sectionRoot);
      return;
    }

    if (isIndexTracked(index)) {
      stopObservingSentinel(sectionRoot.parentElement);
      return;
    }

    // A section with no size can look fully visible, then never report again after it grows.
    // Wait until it has a size, then measure it again.
    if (isZeroArea(entry.boundingClientRect)) {
      reobserveWhenSized(sectionRoot);
      return;
    }

    // If a section has several roots, seeing any one of them counts for the whole section.
    stopObservingSentinel(sectionRoot.parentElement);
    onFeedItemVisible(index);
  };

  const handleEntries = (
    entries: IntersectionObserverEntry[],
    isSectionVisible: (entry: IntersectionObserverEntry) => boolean,
  ) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || !isSectionVisible(entry)) {
        return;
      }
      recordVisibleEntry(entry);
    });
  };

  sectionObservers.standard = new IntersectionObserver(
    entries => {
      handleEntries(entries, entry => entry.intersectionRatio >= HALF_VISIBLE_THRESHOLD);
    },
    { threshold: HALF_VISIBLE_THRESHOLD },
  );

  // A very tall section can never be half on screen, so the half-visible rule would skip it.
  // Treat it as seen when it crosses the middle of the screen, matching the Lua app.
  // Normal sections still use the half-visible rule.
  sectionObservers.tall = new IntersectionObserver(
    entries => {
      handleEntries(entries, entry => isTallerThanTwiceTheViewport(entry.boundingClientRect));
    },
    { rootMargin: TALL_SECTION_ROOT_MARGIN, threshold: 0 },
  );

  // Feed markers use display: contents, so they have no box of their own.
  // Watch the content inside each marker. An empty marker is not watched.
  const observeNewSectionRoots = (mutationObserver: MutationObserver) => {
    observedRoots.forEach(sectionRoot => {
      if (!sectionRoot.isConnected) {
        stopObserving(sectionRoot);
      }
    });

    [...feedColumn.children].forEach(sentinel => {
      const index = parseFeedItemIndex(sentinel);
      if (index == null || isIndexTracked(index)) {
        return;
      }
      // Content can mount inside a marker after the marker itself is added.
      mutationObserver.observe(sentinel, { childList: true });
      [...sentinel.children].forEach(observeRoot);
    });
  };

  // Watch only the feed column and its markers, not deeper content.
  // Changes inside a section, like tiles loading, do not trigger this.
  const mutationObserver = new MutationObserver((_records, observer) => {
    observeNewSectionRoots(observer);
  });
  mutationObserver.observe(feedColumn, { childList: true });
  observeNewSectionRoots(mutationObserver);

  return () => {
    mutationObserver.disconnect();
    sectionObservers.standard?.disconnect();
    sectionObservers.tall?.disconnect();
    resizeObservers.forEach(resizeObserver => {
      resizeObserver.disconnect();
    });
    resizeObservers.clear();
  };
}
