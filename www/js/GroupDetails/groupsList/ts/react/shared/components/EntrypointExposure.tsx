import { cloneElement, FC, ReactElement, useEffect, useRef } from 'react';

/**
 * Fires `onExposure` exactly once, the first time the wrapped element scrolls into view.
 *
 * This extends the fire-once idea in MetricsElement (which fires on mount via `isReady`) with an
 * IntersectionObserver so per-tile exposures only log when the tile is actually visible — the
 * behaviour GRPS-3058/3060 want for lists/grids of communities.
 *
 * The wrapped child must be a single DOM element that accepts a ref.
 */
interface EntrypointExposureProps {
  onExposure: () => void;
  children: ReactElement;
  // don't observe until the data needed to build the event is ready
  isReady?: boolean;
  threshold?: number;
  rootMargin?: string;
}

const EntrypointExposure: FC<EntrypointExposureProps> = ({
  onExposure,
  children,
  isReady = true,
  threshold = 0.5,
  rootMargin = '0px'
}) => {
  const nodeRef = useRef<Element | null>(null);
  const hasLoggedExposure = useRef(false);

  useEffect(() => {
    if (!isReady || hasLoggedExposure.current) {
      return undefined;
    }
    const node = nodeRef.current;
    if (!node) {
      return undefined;
    }

    // Fall back to logging immediately when IntersectionObserver is unavailable (e.g. old browsers,
    // jsdom) so exposures are never silently dropped.
    if (typeof IntersectionObserver === 'undefined') {
      hasLoggedExposure.current = true;
      onExposure();
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasLoggedExposure.current) {
            hasLoggedExposure.current = true;
            onExposure();
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isReady, onExposure, threshold, rootMargin]);

  return cloneElement(children, {
    ref: (node: Element | null) => {
      nodeRef.current = node;
      // preserve any ref the child already had
      const { ref } = children as ReactElement & {
        ref?: React.Ref<Element>;
      };
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<Element | null>).current = node;
      }
    }
  } as Partial<unknown> & { ref: React.Ref<Element> });
};

export default EntrypointExposure;
