import classNames from "classnames";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MutableRefObject,
  type ReactNode,
} from "react";

import { CarouselContext, type CarouselContextValue } from "./CarouselContext";

/**
 * Visibility threshold — an item must be at least 60% inside the viewport to count
 * as "visible". Tuned to match scroll-snap behavior so a tile that's halfway off
 * the edge mid-scroll doesn't toggle the page indicator.
 */
const VISIBILITY_THRESHOLD = 0.6;

type ItemEntry = {
  element: HTMLElement;
  isVisible: boolean;
};

/* -------------------------------------------------------------------------- */
/*                  Internal context: track ref for `<Item>`                  */
/* -------------------------------------------------------------------------- */

const CarouselTrackRefContext = createContext<MutableRefObject<HTMLDivElement | null> | null>(null);

/* -------------------------------------------------------------------------- */
/*                                   Root                                     */
/* -------------------------------------------------------------------------- */

export type CarouselRootProps = {
  children: ReactNode;
  className?: string;
  /** Accessible label for the scroll region. Rendered visually-hidden inside the root. */
  ariaLabel?: string;
};

export function Carousel({ children, className, ariaLabel }: CarouselRootProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Map<string, ItemEntry>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [, forceRender] = useState(0);
  const bumpRender = useCallback(() => {
    forceRender(t => t + 1);
  }, []);

  // Recompute visible indices on every render — itemsRef is mutated synchronously
  // by the IO callback and we trigger a re-render via `bumpRender` to flush state.
  const visibleIndices: number[] = [];
  let i = 0;
  itemsRef.current.forEach(entry => {
    if (entry.isVisible) {
      visibleIndices.push(i);
    }
    i += 1;
  });

  const itemCount = itemsRef.current.size;
  const visibleCount = visibleIndices.length;
  const firstVisible = visibleIndices[0] ?? -1;
  const lastVisible = visibleIndices.at(-1) ?? -1;
  const canPrev = firstVisible > 0;
  const canNext = lastVisible >= 0 && lastVisible < itemCount - 1;
  const allVisible = itemCount > 0 && visibleCount === itemCount;

  const goTo = useCallback((index: number) => {
    const entries = [...itemsRef.current.values()];
    const target = entries[index];
    if (target == null || trackRef.current == null) {
      return;
    }
    trackRef.current.scrollTo({
      left: target.element.offsetLeft - trackRef.current.offsetLeft,
      behavior: "smooth",
    });
  }, []);

  // `next` and `prev` both page by the size of the visible window so the two
  // controls feel symmetric. Without this, `prev` would only move a single
  // item at a time whenever multiple items fit on screen.
  const next = useCallback(() => {
    const target = lastVisible >= 0 ? Math.min(itemCount - 1, lastVisible + 1) : 0;
    goTo(target);
  }, [goTo, itemCount, lastVisible]);

  const prev = useCallback(() => {
    if (firstVisible <= 0) {
      goTo(0);
      return;
    }
    const pageSize = Math.max(1, visibleCount);
    goTo(Math.max(0, firstVisible - pageSize));
  }, [firstVisible, goTo, visibleCount]);

  const registerItem = useCallback<CarouselContextValue["registerItem"]>(
    (id, element) => {
      itemsRef.current.set(id, { element, isVisible: false });
      observerRef.current?.observe(element);
      bumpRender();
      return () => {
        observerRef.current?.unobserve(element);
        itemsRef.current.delete(id);
        bumpRender();
      };
    },
    [bumpRender],
  );

  // One IntersectionObserver scoped to the track for the carousel's lifetime.
  // Items observe themselves on registration so order-of-mount doesn't matter.
  useEffect(() => {
    const root = trackRef.current;
    if (root == null || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        // Track changes via local mutation count (lint disallows mutating a `let`
        // captured from the outer scope inside a `forEach`).
        const changes: boolean[] = [];
        entries.forEach(observerEntry => {
          const { target, intersectionRatio } = observerEntry;
          itemsRef.current.forEach((entry, key) => {
            if (entry.element !== target) {
              return;
            }
            const nextVisible = intersectionRatio >= VISIBILITY_THRESHOLD;
            if (entry.isVisible !== nextVisible) {
              // Replace the entry rather than mutating in place — keeps the
              // `no-param-reassign` rule satisfied.
              itemsRef.current.set(key, { element: entry.element, isVisible: nextVisible });
              changes.push(true);
            }
          });
        });
        if (changes.length > 0) {
          bumpRender();
        }
      },
      { root, threshold: [0, VISIBILITY_THRESHOLD, 1] },
    );

    observerRef.current = observer;
    itemsRef.current.forEach(entry => {
      observer.observe(entry.element);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [bumpRender]);

  const value = useMemo<CarouselContextValue>(
    () => ({
      itemCount,
      currentPage: firstVisible,
      canPrev,
      canNext,
      allVisible,
      goTo,
      next,
      prev,
      registerItem,
    }),
    [allVisible, canNext, canPrev, firstVisible, goTo, itemCount, next, prev, registerItem],
  );

  return (
    <CarouselContext.Provider value={value}>
      <CarouselTrackRefContext.Provider value={trackRef}>
        <div
          aria-label={ariaLabel}
          className={classNames("relative min-width-0 clip-x", className)}
          data-testid="carousel-root"
          role={ariaLabel != null ? "region" : undefined}
        >
          {children}
        </div>
      </CarouselTrackRefContext.Provider>
    </CarouselContext.Provider>
  );
}

export type CarouselTrackProps = ComponentProps<"div">;

function CarouselTrack({ className, children, ...rest }: CarouselTrackProps) {
  const internalRef = useContext(CarouselTrackRefContext);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (internalRef != null) {
        internalRef.current = node;
      }
    },
    [internalRef],
  );

  return (
    <div
      ref={setRef}
      className={classNames("flex flex-row gap-medium min-width-0 width-full scroll-x", className)}
      data-testid="carousel-track"
      // The foundation-tailwind preset has no scroll-snap or
      // scrollbar-hiding utilities, so apply them inline.
      style={{
        scrollSnapType: "x mandatory",
        scrollBehavior: "smooth",
        scrollbarWidth: "none",
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export { CarouselTrack };
