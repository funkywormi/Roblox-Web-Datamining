import { useCallback, useEffect, useState } from "react";
import { getPlaceholderWrapperRenderFlags } from "./getPlaceholderWrapperRenderFlags";

export type UsePlaceholderWrapperStateOptions = {
  isPlaceholder: boolean;
  hasReal: boolean;
  mountRealDuringPlaceholder: boolean;
};

export type PlaceholderWrapperState = {
  shouldRenderReal: boolean;
  /** Placeholder subtree is still mounted (including during fade-out). */
  placeholderMounted: boolean;
  /** Fires when the placeholder fade-out transition completes. */
  onPlaceholderTransitionEnd: () => void;
};

/**
 * State machine for placeholder show/hide transitions.
 *
 * Lifecycle (aligned with lua `SduiPlaceholderWrapper` + `PlaceholderHost`):
 * 1. `isPlaceholder: false -> true` — mount placeholder (`fadeOut = false`).
 * 2. `isPlaceholder: true -> false` — keep placeholder mounted while opacity fades to 0.
 * 3. Fade complete — unmount placeholder (`onPlaceholderTransitionEnd`).
 *
 * Opacity is derived from `isPlaceholder` in the component, matching lua's
 * `fadeOut = not isPlaceholder`.
 *
 * When there is no `real` content, the placeholder unmounts immediately once
 * `isPlaceholder` becomes false.
 */
export function usePlaceholderWrapperState({
  isPlaceholder,
  hasReal,
  mountRealDuringPlaceholder,
}: UsePlaceholderWrapperStateOptions): PlaceholderWrapperState {
  const [placeholderMounted, setPlaceholderMounted] = useState(isPlaceholder);

  const { shouldRenderReal } = getPlaceholderWrapperRenderFlags({
    isPlaceholder,
    hasReal,
    mountRealDuringPlaceholder,
    placeholderMounted,
  });

  useEffect(() => {
    if (isPlaceholder && !placeholderMounted) {
      setPlaceholderMounted(true);
    }
  }, [isPlaceholder, placeholderMounted]);

  useEffect(() => {
    if (!isPlaceholder && placeholderMounted && !hasReal) {
      setPlaceholderMounted(false);
    }
  }, [isPlaceholder, placeholderMounted, hasReal]);

  const onPlaceholderTransitionEnd = useCallback(() => {
    if (!isPlaceholder) {
      setPlaceholderMounted(false);
    }
  }, [isPlaceholder]);

  return {
    shouldRenderReal,
    placeholderMounted,
    onPlaceholderTransitionEnd,
  };
}
