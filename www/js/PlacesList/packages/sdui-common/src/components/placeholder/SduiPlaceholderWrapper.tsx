"use client";
import React from "react";
import { DEFAULT_PLACEHOLDER_TRANSITION_SECONDS } from "./constants";
import { usePlaceholderWrapperState } from "./usePlaceholderWrapperState";

export type SduiPlaceholderWrapperProps = {
  isPlaceholder?: boolean;
  real?: React.ReactNode;
  placeholder?: React.ReactNode;
  transitionDurationSeconds?: number;
  /**
   * When true, `real` stays mounted (hidden) during placeholder so it defines layout
   * size while a generic shimmer overlay is shown. When false, `real` is omitted
   * from the tree until the placeholder unmounts (swap mode).
   */
  mountRealDuringPlaceholder?: boolean;
  className?: string;
};

/**
 * Swaps or overlays between real SDUI content and a placeholder (typically
 * `SduiSkeleton`) with a short opacity transition.
 *
 * Two render modes:
 * - **Swap** (`mountRealDuringPlaceholder={false}`, default): placeholder replaces
 *   real content in normal flow. Matches lua when real is unmounted during load.
 * - **Overlay** (`mountRealDuringPlaceholder={true}`): real content stays mounted
 *   but hidden (`visibility: hidden`) so it sizes the box; placeholder is
 *   `position: absolute` on top. Web pattern for generic skeleton overlays.
 *
 * The outer wrapper stays mounted so `real` is not remounted when the placeholder
 * layer unmounts after fade-out (same stability goal as lua's always-present Frame).
 */
export function SduiPlaceholderWrapper({
  isPlaceholder = false,
  real,
  placeholder,
  transitionDurationSeconds = DEFAULT_PLACEHOLDER_TRANSITION_SECONDS,
  mountRealDuringPlaceholder = false,
  className,
}: SduiPlaceholderWrapperProps): React.JSX.Element {
  const hasReal = real != null;
  const { shouldRenderReal, placeholderMounted, onPlaceholderTransitionEnd } =
    usePlaceholderWrapperState({
      isPlaceholder,
      hasReal,
      mountRealDuringPlaceholder,
    });

  const hideRealContent = isPlaceholder && mountRealDuringPlaceholder && hasReal;
  const shouldOverlayPlaceholder = shouldRenderReal && placeholderMounted;

  return (
    <div
      data-testid="sdui-placeholder-wrapper"
      className={className}
      style={{ position: "relative", width: "100%" }}
    >
      {shouldRenderReal ? (
        <div
          aria-hidden={hideRealContent}
          style={{ visibility: hideRealContent ? "hidden" : "visible", width: "100%" }}
        >
          {real}
        </div>
      ) : null}
      {placeholderMounted && placeholder ? (
        <div
          data-testid={shouldOverlayPlaceholder ? "sdui-placeholder-layer" : undefined}
          style={
            shouldOverlayPlaceholder
              ? {
                  position: "absolute",
                  inset: 0,
                  zIndex: 20,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  opacity: isPlaceholder ? 1 : 0,
                  transition: `opacity ${transitionDurationSeconds}s ease`,
                }
              : { width: "100%" }
          }
          onTransitionEnd={shouldOverlayPlaceholder ? onPlaceholderTransitionEnd : undefined}
        >
          {placeholder}
        </div>
      ) : null}
    </div>
  );
}

export default SduiPlaceholderWrapper;
