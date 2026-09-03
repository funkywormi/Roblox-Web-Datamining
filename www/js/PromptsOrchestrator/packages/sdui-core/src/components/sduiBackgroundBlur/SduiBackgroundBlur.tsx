"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { SduiGradient, SduiRendererInjectedProps } from "../../types";
import { buildGradientCss } from "../../utils/valueToCss";

export const DEFAULT_BACKGROUND_BLUR_RADIUS_PX = 20;
export const DEFAULT_BACKGROUND_BLUR_OPACITY = 1;
export const DEFAULT_SCROLL_FADE_RANGE_PX = 64;
/** Default CSS mask: solid through mid-height, then a quad ease-in fade out. */
export const DEFAULT_BACKGROUND_BLUR_MASK =
  "linear-gradient(to bottom, #000 0%, #000 45%, rgba(0, 0, 0, 0.96) 56%, rgba(0, 0, 0, 0.84) 67%, rgba(0, 0, 0, 0.64) 78%, rgba(0, 0, 0, 0.36) 89%, transparent 100%)";

export interface ScrollFadeParams {
  scrollY: number;
  viewportHeight: number;
  blurHeightPx: number;
  viewportPercent: number;
  offsetPx: number;
  rangePx: number;
}

export function getScrollFadeOpacity({
  scrollY,
  viewportHeight,
  blurHeightPx,
  viewportPercent,
  offsetPx,
  rangePx,
}: ScrollFadeParams): number {
  const fadeAnchorPx = viewportHeight * viewportPercent + offsetPx;
  const fadeEndScrollY = fadeAnchorPx - blurHeightPx;
  const fadeStartScrollY = fadeEndScrollY - rangePx;

  if (rangePx <= 0) {
    return scrollY >= fadeEndScrollY ? 1 : 0;
  }
  if (scrollY <= fadeStartScrollY) {
    return 0;
  }
  if (scrollY >= fadeEndScrollY) {
    return 1;
  }

  return (scrollY - fadeStartScrollY) / rangePx;
}

export interface SduiBackgroundBlurProps extends SduiRendererInjectedProps {
  blurRadius?: number;
  scrimGradient?: SduiGradient;
  opacity?: number;
  mask?: string;
  /** When set, opacity ramps in from scroll position using viewport percent + offset. */
  scrollFadeViewportPercent?: number;
  scrollFadeOffsetPx?: number;
  scrollFadeRangePx?: number;
}

export function getBackgroundBlurStyle({
  blurRadius = DEFAULT_BACKGROUND_BLUR_RADIUS_PX,
  scrimGradient,
  opacity = DEFAULT_BACKGROUND_BLUR_OPACITY,
  mask = DEFAULT_BACKGROUND_BLUR_MASK,
}: Pick<
  SduiBackgroundBlurProps,
  "blurRadius" | "scrimGradient" | "opacity" | "mask"
>): CSSProperties {
  const blur = `blur(${blurRadius}px)`;

  return {
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    background: buildGradientCss(scrimGradient),
    opacity,
    maskImage: mask,
    WebkitMaskImage: mask,
  };
}

/**
 * Decorative backdrop blur that fills its parent layer. Optionally fades in
 * from scroll position when scroll-fade props are configured.
 */
export function SduiBackgroundBlur({
  blurRadius = DEFAULT_BACKGROUND_BLUR_RADIUS_PX,
  scrimGradient,
  opacity = DEFAULT_BACKGROUND_BLUR_OPACITY,
  mask = DEFAULT_BACKGROUND_BLUR_MASK,
  scrollFadeViewportPercent,
  scrollFadeOffsetPx = 0,
  scrollFadeRangePx = DEFAULT_SCROLL_FADE_RANGE_PX,
}: SduiBackgroundBlurProps) {
  const blurRef = useRef<HTMLDivElement>(null);
  const [scrollFadeProgress, setScrollFadeProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const scrollFadeEnabled = scrollFadeViewportPercent != null;

  const updateScrollFade = useCallback(() => {
    if (scrollFadeViewportPercent == null) {
      return;
    }

    const element = blurRef.current;
    if (!element || typeof window === "undefined") {
      setScrollFadeProgress(0);
      return;
    }

    const progress = getScrollFadeOpacity({
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      blurHeightPx: element.getBoundingClientRect().height,
      viewportPercent: scrollFadeViewportPercent,
      offsetPx: scrollFadeOffsetPx,
      rangePx: scrollFadeRangePx,
    });
    setScrollFadeProgress(progress);
  }, [scrollFadeOffsetPx, scrollFadeRangePx, scrollFadeViewportPercent]);

  useEffect(() => {
    if (!scrollFadeEnabled) {
      return;
    }

    const scheduleUpdate = () => {
      if (rafRef.current != null) {
        return;
      }
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updateScrollFade();
      });
    };

    updateScrollFade();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scrollFadeEnabled, updateScrollFade]);

  const effectiveOpacity = scrollFadeEnabled ? opacity * scrollFadeProgress : opacity;

  return (
    <div
      ref={blurRef}
      aria-hidden="true"
      className="width-full height-full pointer-events-none"
      data-testid="sdui-background-blur"
      style={getBackgroundBlurStyle({ blurRadius, scrimGradient, opacity: effectiveOpacity, mask })}
    />
  );
}
