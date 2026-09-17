import { useCallback, useState } from 'react';

const shallowEqual = <T>(a: T, b: T): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  const aKeys = Object.keys(a) as (keyof T)[];
  const bKeys = Object.keys(b) as (keyof T)[];
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(k => Object.is(a[k], b[k]));
};

export type UseDirtyTrackingOptions<T> = {
  /**
   * The latest value the user is editing. Typically composed from individual `useState` cells
   * (title, content, asset id, upload version, ...).
   */
  current: T;
  /**
   * The initial baseline. Used as the starting `baseline` until the caller `commit`s a new one
   * after a successful save.
   */
  initial: T;
  /** Optional custom equality. Defaults to a shallow `Object.is` per-key compare. */
  isEqual?: (a: T, b: T) => boolean;
};

export type UseDirtyTrackingResult<T> = {
  hasChanges: boolean;
  baseline: T;
  /** Pin a new baseline (call after a successful save). */
  commit: (next: T) => void;
};

/**
 * Tracks whether `current` differs from a `baseline` snapshot. Callers `commit(snapshot)`
 * after a successful save to pin a new baseline; subsequent edits flip `hasChanges` back on.
 *
 * Lives in the composer's hook folder for now; promote to `shared/` if a second consumer
 * appears.
 */
export const useDirtyTracking = <T>({
  current,
  initial,
  isEqual = shallowEqual
}: UseDirtyTrackingOptions<T>): UseDirtyTrackingResult<T> => {
  const [baseline, setBaseline] = useState<T>(initial);

  const commit = useCallback((next: T) => {
    setBaseline(next);
  }, []);

  return {
    hasChanges: !isEqual(current, baseline),
    baseline,
    commit
  };
};
