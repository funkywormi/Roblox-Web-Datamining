import { useEffect, useRef, useCallback } from 'react';

type UseThrottledScrollParams = {
  onScroll: () => void;
  intervalMs?: number;
  scrollContainerRef?: React.RefObject<HTMLElement>;
};

const useThrottledScroll = ({
  onScroll,
  intervalMs = 50,
  scrollContainerRef
}: UseThrottledScrollParams): void => {
  const callbackId = useRef<number | null>(null);
  const lastExecutionTime = useRef<number>(0);

  const throttledScrollHandler = useCallback(() => {
    const nowTime = Date.now();
    const timeSinceLastExecution = nowTime - lastExecutionTime.current;

    if (callbackId.current !== null) {
      clearTimeout(callbackId.current);
    }

    if (timeSinceLastExecution >= intervalMs) {
      onScroll();
      lastExecutionTime.current = nowTime;
      return;
    }

    const remainingTime = intervalMs - timeSinceLastExecution;

    callbackId.current = window.setTimeout(() => {
      onScroll();
      callbackId.current = null;
      lastExecutionTime.current = Date.now();
    }, remainingTime);
  }, [onScroll, intervalMs]);

  useEffect(() => {
    const scrollElement = scrollContainerRef?.current ?? window;
    scrollElement.addEventListener('scroll', throttledScrollHandler, { passive: true });

    onScroll();

    return () => {
      scrollElement.removeEventListener('scroll', throttledScrollHandler);
      if (callbackId.current !== null) {
        clearTimeout(callbackId.current);
        callbackId.current = null;
      }
    };
  }, [throttledScrollHandler, onScroll, scrollContainerRef]);
};

export default useThrottledScroll;
