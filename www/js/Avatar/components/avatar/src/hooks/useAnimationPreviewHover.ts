import { useCallback, useEffect, useRef, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import {
  ANIMATION_HOVER_INTENT_MS,
  claimAnimationPreview,
  useIsActiveAnimationPreview,
} from "../utils/animationPreview";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

const supportsHover = (): boolean => {
  if (browserWindow == null || typeof browserWindow.matchMedia !== "function") {
    return browserWindow != null;
  }
  return browserWindow.matchMedia("(hover: hover)").matches;
};

/**
 * Debounced hover/focus intent for animation previews. Start is delayed; end is immediate.
 * Touch devices never report hover, reduced-motion users never preview, and only the most
 * recently hovered card is reported as playing.
 */
export default function useAnimationPreviewHover(
  previewKey: string,
  enabled: boolean,
): {
  isPlaying: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
} {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const canPreview = enabled && !reducedMotion;
  const isActive = useIsActiveAnimationPreview(previewKey);

  const cancelPending = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const onHoverStart = useCallback(() => {
    if (!canPreview || !supportsHover()) {
      return;
    }
    cancelPending();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setIsHovered(true);
    }, ANIMATION_HOVER_INTENT_MS);
  }, [canPreview, cancelPending]);

  const onHoverEnd = useCallback(() => {
    cancelPending();
    setIsHovered(false);
  }, [cancelPending]);

  useEffect(() => {
    if (!canPreview) {
      cancelPending();
      setIsHovered(false);
    }
  }, [canPreview, cancelPending]);

  useEffect(() => {
    if (!isHovered || !canPreview) {
      return undefined;
    }
    return claimAnimationPreview(previewKey);
  }, [isHovered, canPreview, previewKey]);

  return { isPlaying: isHovered && canPreview && isActive, onHoverStart, onHoverEnd };
}
