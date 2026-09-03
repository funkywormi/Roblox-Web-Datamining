import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

type ScrollFlashOverlayProps = {
  onComplete: () => void;
  enableScrollIntoView?: boolean;
};

const SCREEN_EDGE_PADDING = 150;
const FLASH_DURATION_MS = 2000;

const ScrollFlashOverlay = ({
  onComplete,
  enableScrollIntoView = true
}: ScrollFlashOverlayProps): JSX.Element => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isOnScreen, setIsOnScreen] = React.useState(false);

  // determine whether or not we have to scroll the element into view
  useEffect(() => {
    if (!enableScrollIntoView) return;

    const element = overlayRef.current;
    if (!element) return;

    const { top, bottom } = element.getBoundingClientRect();
    if (top < SCREEN_EDGE_PADDING || bottom > window.innerHeight - SCREEN_EDGE_PADDING) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // wait until element is in view, then flash the overlay
  useEffect(() => {
    const element = overlayRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isOnScreen) {
          setIsOnScreen(true);
          setTimeout(onComplete, FLASH_DURATION_MS);
        }
      },
      {
        root: null, // checks against viewport
        threshold: 0.5 // triggers flash animation when at least 50% of the element is visible
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [isOnScreen, onComplete]);

  return (
    <div
      className={classNames('scroll-flash-overlay', isOnScreen && 'scroll-flash-overlay-active')}
      ref={overlayRef}
    />
  );
};

export default ScrollFlashOverlay;
