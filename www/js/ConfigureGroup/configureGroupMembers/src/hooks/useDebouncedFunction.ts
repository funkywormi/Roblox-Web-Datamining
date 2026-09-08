import type { RefObject } from 'react';
import { useRef, useCallback } from 'react';

type DebouncedFunction<TArgs extends unknown[]> = (...args: TArgs) => void;

const useDebouncedFunction = <Args extends unknown[]>(
  fn: DebouncedFunction<Args>,
  delay: number,
): [DebouncedFunction<Args>, () => void, RefObject<number | null>] => {
  const debounceTimeoutRef = useRef<number | null>(null);

  const clearDebounceTimeout = useCallback(() => {
    if (debounceTimeoutRef.current !== null) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, [debounceTimeoutRef]);

  const debouncedFunction = useCallback(
    (...args: Args) => {
      clearDebounceTimeout();
      debounceTimeoutRef.current = window.setTimeout(() => {
        fn(...args);
        debounceTimeoutRef.current = null;
      }, delay);
    },
    [fn, delay, clearDebounceTimeout],
  );

  return [debouncedFunction, clearDebounceTimeout, debounceTimeoutRef];
};

export default useDebouncedFunction;
