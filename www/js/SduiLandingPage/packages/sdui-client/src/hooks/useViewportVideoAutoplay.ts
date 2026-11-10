import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { observeIntersection } from "@rbx/core-lib/element-visibility";
import { VIEWPORT_AUTOPLAY_VISIBLE_RATIO } from "../consts/videoAutoplay";
import { prefersReducedMotion, subscribeToReducedMotion } from "../utils/prefersReducedMotion";
import {
  getViewportVideoAutoplayCoordinator,
  type ViewportAutoplayHandle,
} from "../utils/viewportVideoAutoplayCoordinator";

interface UseViewportVideoAutoplayOptions {
  enabled: boolean;
  universeId: string | undefined;
  elementRef: RefObject<Element>;
}

/**
 * Reports whether this tile's video should be playing under viewport autoplay. The page-wide
 * coordinator decides which tile wins.
 */
export function useViewportVideoAutoplay({
  enabled,
  universeId,
  elementRef,
}: UseViewportVideoAutoplayOptions): {
  isPlaybackRequested: boolean;
  markEnded: () => void;
  markBlocked: () => void;
} {
  const [isPlaybackRequested, setIsPlaybackRequested] = useState(false);
  const handleRef = useRef<ViewportAutoplayHandle | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!enabled || !element || !universeId) {
      return undefined;
    }

    let handle: ViewportAutoplayHandle | undefined;
    let stopObserving: (() => void) | undefined;

    const stopPlayback = (): void => {
      stopObserving?.();
      stopObserving = undefined;
      if (!handle) {
        return;
      }
      handle.unregister();
      handle = undefined;
      handleRef.current = null;
      // unregister skips the setter, so clear it here. Otherwise a stale `true` can mount the
      // video for one render when the tile is re-enabled.
      setIsPlaybackRequested(false);
    };

    const syncPlayback = (): void => {
      if (prefersReducedMotion()) {
        stopPlayback();
        return;
      }
      if (handle) {
        return;
      }

      setIsPlaybackRequested(false);
      handle = getViewportVideoAutoplayCoordinator().register({
        key: universeId,
        element,
        setPlaybackRequested: setIsPlaybackRequested,
      });
      handleRef.current = handle;

      // `isIntersecting` stays true while a tile is partly visible, so compare the ratio.
      stopObserving = observeIntersection(
        { elements: [element], threshold: VIEWPORT_AUTOPLAY_VISIBLE_RATIO },
        entries => {
          const latest = entries.at(-1);
          if (!latest || !handle) {
            return;
          }
          handle.setVisible(
            latest.isIntersecting && latest.intersectionRatio >= VIEWPORT_AUTOPLAY_VISIBLE_RATIO,
          );
        },
      );
    };

    syncPlayback();
    const unsubscribeFromReducedMotion = subscribeToReducedMotion(syncPlayback);

    return () => {
      unsubscribeFromReducedMotion();
      stopPlayback();
    };
  }, [enabled, universeId, elementRef]);

  const markEnded = useCallback(() => {
    handleRef.current?.markEnded();
  }, []);

  const markBlocked = useCallback(() => {
    handleRef.current?.markBlocked();
  }, []);

  return { isPlaybackRequested: enabled && isPlaybackRequested, markEnded, markBlocked };
}
