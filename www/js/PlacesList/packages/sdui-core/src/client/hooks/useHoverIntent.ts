import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_HOVER_INTENT_DELAY_MS = 100;

function supportsHover(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // jsdom and older browsers do not implement matchMedia; assume hover is available.
  if (typeof window.matchMedia !== "function") {
    return true;
  }

  return window.matchMedia("(hover: hover)").matches;
}

/**
 * Debounced pointer/keyboard hover intent.
 * The delay keeps a cursor sweeping across a carousel from
 * starting media on every tile it crosses.
 *
 * Always reports `false` where hover is not a real input (touch), since those
 * devices still emit mouseover on tap.
 *
 * @param options.delayMs - The delay in milliseconds before reporting hover.
 */
export function useHoverIntent({ delayMs = DEFAULT_HOVER_INTENT_DELAY_MS } = {}): {
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
} {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const schedule = useCallback(
    (next: boolean) => {
      cancelPending();
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setIsHovered(next);
      }, delayMs);
    },
    [cancelPending, delayMs],
  );

  const onHoverStart = useCallback(() => {
    if (supportsHover()) {
      schedule(true);
    }
  }, [schedule]);

  const onHoverEnd = useCallback(() => {
    schedule(false);
  }, [schedule]);

  return { isHovered, onHoverStart, onHoverEnd };
}
