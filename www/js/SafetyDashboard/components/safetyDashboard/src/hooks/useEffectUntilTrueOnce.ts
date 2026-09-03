import { useEffect, useRef } from "react";

/**
 * Run the callback function until it returns true. Once returned true, it will
 * not run again. This is useful for one-time side-effects (like analytics) that
 * needs to run after some condition is met.
 *
 * Example:
 * ```tsx
 * useEffectUntilTrueOnce(() => {
 *  if (!data) {
 *   return false;
 *  }
 *  sendAnalyticsEvent({ name: data.name });
 *  return true;
 * });
 * ```
 *
 * I considered other options such as
 * `useRunOnceOnCondtion(condition, runOnceFn)`, but that has annoying typing, since TS can't
 * narrow the variables inside `runOnceFn` based on the `condition`.
 *
 */
export const useEffectUntilTrueOnce = (callback: () => boolean): void => {
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current && callback()) {
      hasRun.current = true;
    }
  }, [callback]);
};
