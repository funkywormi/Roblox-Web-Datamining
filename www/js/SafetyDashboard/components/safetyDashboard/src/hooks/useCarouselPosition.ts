import { useCallback, useRef, useState } from "react";
import type { TCollectionCarouselHandle } from "@rbx/foundation-ui";

const CARDS_VISIBLE_THRESHOLD = 1.75;

interface CarouselPosition {
  carouselRef: (handle: TCollectionCarouselHandle | null) => void;
  activeIndex: number;
  showDots: boolean;
}

/**
 * Tracks which direct child of a horizontally-scrolling container is most
 * visible, returning its index. Also reports whether dots should be shown
 * based on whether the container is narrow enough to show only ~1.75 cards.
 */
function useCarouselPosition(): CarouselPosition {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDots, setShowDots] = useState(false);

  const containerElementRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | undefined>(undefined);
  const animationFrameRef = useRef(0);

  /**
   * Measures the position of the active card in the carousel and updates the state accordingly.
   */
  const measure = useCallback(() => {
    const container = containerElementRef.current;
    if (!container) {
      return;
    }

    // Collect all of the cards in the carousel container.
    const cards = [...container.children].filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );

    const [firstCard, secondCard] = cards;
    if (!firstCard) {
      return;
    }

    // Derive the width of the first card and the gap between the first and second card (if it exists).
    const cardWidth = firstCard.offsetWidth;
    const gap = secondCard ? secondCard.offsetLeft - (firstCard.offsetLeft + cardWidth) : 0;

    /**
     * Show dots only when the container is too narrow to fit ~1.75 cards at once;
     * wider containers reveal enough cards that paging indicators add no value.
     */
    const threshold = cardWidth * CARDS_VISIBLE_THRESHOLD + gap;
    setShowDots(container.clientWidth < threshold);

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;

    // Go through every card to find the one that is closest to the center of the container.
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    setActiveIndex(bestIndex);
  }, []);

  /**
   * Since scroll events fire rapidly, we need to coalesce them into a single measurement
   * per frame.
   */
  const handleScroll = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(measure);
  }, [measure]);

  /**
   * Clean up previous containers and observers before attaching to the new container.
   * The Foundation CollectionCarousel exposes its scroll element through the imperative
   * handle.
   */
  const carouselRef = useCallback(
    (handle: TCollectionCarouselHandle | null) => {
      const node = handle?.scrollContainer ?? null;

      const previous = containerElementRef.current;
      if (previous) {
        previous.removeEventListener("scroll", handleScroll);
      }

      observerRef.current?.disconnect();
      cancelAnimationFrame(animationFrameRef.current);

      containerElementRef.current = node;
      if (!node) {
        return;
      }

      node.addEventListener("scroll", handleScroll, { passive: true });

      /**
       * ResizeObserver may be absent (older browsers / non-DOM test envs); skip it
       * gracefully and rely on the initial measure plus scroll-driven updates.
       */
      if (typeof ResizeObserver !== "undefined") {
        observerRef.current = new ResizeObserver(measure);
        observerRef.current.observe(node);
      }

      // Measure once on mount so state is correct before any scroll/resize occurs.
      measure();
    },
    [handleScroll, measure],
  );

  return { carouselRef, activeIndex, showDots };
}

export default useCarouselPosition;
