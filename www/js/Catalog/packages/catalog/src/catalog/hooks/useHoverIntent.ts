import { useCallback, useEffect, useRef, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";

function supportsHover(): boolean {
  if (browserWindow == null || typeof browserWindow.matchMedia !== "function") {
    // jsdom and older browsers do not implement matchMedia; assume hover is available.
    return browserWindow != null;
  }

  return browserWindow.matchMedia("(hover: hover)").matches;
}

/**
 * Debounced pointer/keyboard hover intent. Start is delayed so cursor sweeps do not mount
 * WebGL; end is immediate so previews tear down as soon as the pointer leaves.
 * When `enabled` is false, pending timers clear and hover reports false.
 */
export default function useHoverIntent({
  delayMs,
  enabled = true,
}: {
  delayMs: number;
  enabled?: boolean;
}): {
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

  useEffect(() => {
    if (!enabled) {
      cancelPending();
      setIsHovered(false);
    }
  }, [enabled, cancelPending]);

  const onHoverStart = useCallback(() => {
    if (!enabled || !supportsHover()) {
      return;
    }
    cancelPending();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setIsHovered(true);
    }, delayMs);
  }, [cancelPending, delayMs, enabled]);

  const onHoverEnd = useCallback(() => {
    cancelPending();
    setIsHovered(false);
  }, [cancelPending]);

  return { isHovered: enabled && isHovered, onHoverStart, onHoverEnd };
}
