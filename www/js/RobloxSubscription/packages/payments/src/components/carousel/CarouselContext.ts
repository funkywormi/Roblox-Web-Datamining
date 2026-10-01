import { createContext } from "react";

/**
 * Shared state for the {@link Carousel} compound components.
 *
 * Each `<Carousel.Item>` registers itself on mount so the root can compute which
 * items are currently visible inside the scrolling track. Visibility (not item
 * count) drives `canPrev`, `canNext`, and `currentPage` — that way a track that
 * fits all items at large breakpoints naturally collapses to a single page and
 * hides arrows / dots without any breakpoint-specific code.
 */
export type CarouselContextValue = {
  itemCount: number;
  /** Index of the first currently-visible item; -1 before first measurement. */
  currentPage: number;
  /** True when there is room to scroll right (next page exists). */
  canNext: boolean;
  /** True when there is room to scroll left (prev page exists). */
  canPrev: boolean;
  /** True when every registered item is visible at once (single-page state). */
  allVisible: boolean;
  /** Imperatively scroll the track so that `index` aligns to the start. */
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Internal: items register/unregister themselves and report visibility. */
  registerItem: (id: string, element: HTMLElement) => () => void;
};

function noop(): void {
  // intentional: default context callbacks do nothing until <Carousel> mounts.
}

export const defaultCarouselContext: CarouselContextValue = {
  itemCount: 0,
  currentPage: -1,
  canNext: false,
  canPrev: false,
  allVisible: true,
  goTo: noop,
  next: noop,
  prev: noop,
  registerItem: () => noop,
};

export const CarouselContext = createContext<CarouselContextValue>(defaultCarouselContext);
