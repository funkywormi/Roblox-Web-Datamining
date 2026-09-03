import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { NavigateBeforeIcon, NavigateNextIcon } from '@rbx/ui';
import classNames from 'classnames';

const SCROLL_TRANSITION_DURATION_MS = 300;

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const ItemCarousel = ({
  className,
  onScroll,
  controlsDisabled,
  scrollRef: propsScrollRef,
  controlsClassName,
  children
}: {
  className?: string;
  onScroll?: () => void;
  controlsDisabled?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement>;
  controlsClassName?: string;
  children: ReactNode;
}): JSX.Element => {
  const instanceScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = propsScrollRef ?? instanceScrollRef;

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollBoundaries = useCallback(
    (scrollLeft: number) => {
      if (!scrollRef.current) return;
      const { scrollWidth, clientWidth } = scrollRef.current;

      const roundedScrollLeft = Math.round(scrollLeft);
      setIsAtStart(roundedScrollLeft <= 0);
      setIsAtEnd(roundedScrollLeft + clientWidth >= scrollWidth);
    },
    [scrollRef]
  );

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      if (!scrollRef.current || isTransitioning || controlsDisabled) return;

      const { scrollLeft, scrollWidth, clientWidth, childNodes } = scrollRef.current;
      const roundedScrollLeft = Math.round(scrollLeft);
      let desiredScrollPosition = roundedScrollLeft;

      // scroll by a full page; the last visible item becomes the first of the next page (and vice versa)
      if (direction === 'right') {
        const cutoffRight = roundedScrollLeft + clientWidth;
        // Walk all items and keep updating to the last one that fits fully in view
        for (let i = 0; i < childNodes.length; i++) {
          const child = childNodes[i] as HTMLElement;
          if (child.offsetLeft + child.offsetWidth <= cutoffRight) {
            desiredScrollPosition = child.offsetLeft;
          }
        }

        if (desiredScrollPosition <= roundedScrollLeft) {
          for (let i = 0; i < childNodes.length; i++) {
            const child = childNodes[i] as HTMLElement;
            if (child.offsetLeft > roundedScrollLeft) {
              desiredScrollPosition = child.offsetLeft;
              break;
            }
          }
        }
      } else {
        // Find the first item at or past the current scroll position and place it at the right edge
        for (let i = 0; i < childNodes.length; i++) {
          const child = childNodes[i] as HTMLElement;
          if (child.offsetLeft >= roundedScrollLeft) {
            desiredScrollPosition = Math.max(0, child.offsetLeft + child.offsetWidth - clientWidth);
            break;
          }
        }
      }

      const maxScrollPosition = scrollWidth - clientWidth;
      const realScrollPosition = clamp(desiredScrollPosition, 0, maxScrollPosition);

      setIsTransitioning(true);
      scrollRef.current.scrollTo({
        left: realScrollPosition,
        behavior: 'smooth'
      });

      checkScrollBoundaries(Math.round(realScrollPosition));

      // we just have to guess when the scroll transition is done
      // add a buffer to the transition duration to ensure the transition is complete
      setTimeout(() => setIsTransitioning(false), SCROLL_TRANSITION_DURATION_MS + 100);
    },
    [isTransitioning, controlsDisabled, checkScrollBoundaries, scrollRef]
  );

  const onScrollPositionUpdated = useCallback(() => {
    const scrollNode = scrollRef.current;
    if (!scrollNode) return;

    if (!isTransitioning) {
      checkScrollBoundaries(Math.round(scrollNode.scrollLeft));
    }

    onScroll?.();
  }, [checkScrollBoundaries, onScroll, isTransitioning, scrollRef]);

  const handleScrollLeft = useCallback(() => {
    scroll('left');
  }, [scroll]);

  const handleScrollRight = useCallback(() => {
    scroll('right');
  }, [scroll]);

  // this effect ensures visual state is correctly updated even when the screen
  // is resized, the content changes, or the user scrolls the carousel
  useEffect(() => {
    const scrollNode = scrollRef.current;
    if (!scrollNode) return;

    scrollNode.addEventListener('scroll', onScrollPositionUpdated);

    const resizeObserver = new ResizeObserver(onScrollPositionUpdated);
    resizeObserver.observe(scrollNode);

    const mutationObserver = new MutationObserver(onScrollPositionUpdated);
    mutationObserver.observe(scrollNode, { childList: true });

    // eslint-disable-next-line consistent-return
    return () => {
      scrollNode.removeEventListener('scroll', onScrollPositionUpdated);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [onScrollPositionUpdated, scrollRef]);

  return (
    <div className={classNames(className, 'item-carousel-container')}>
      <div className={classNames('item-carousel-controls', controlsClassName)}>
        <button
          type='button'
          className={classNames(
            'item-carousel-arrow item-carousel-arrow-left',
            isAtStart && 'invisible',
            (isTransitioning || controlsDisabled) && 'disabled'
          )}
          onClick={handleScrollLeft}>
          <NavigateBeforeIcon />
        </button>
        <button
          type='button'
          className={classNames(
            'item-carousel-arrow item-carousel-arrow-right',
            isAtEnd && 'invisible',
            (isTransitioning || controlsDisabled) && 'disabled'
          )}
          onClick={handleScrollRight}>
          <NavigateNextIcon />
        </button>
      </div>
      <div ref={scrollRef} className='item-carousel-scroll-wrapper'>
        {children}
      </div>
    </div>
  );
};

export default ItemCarousel;
