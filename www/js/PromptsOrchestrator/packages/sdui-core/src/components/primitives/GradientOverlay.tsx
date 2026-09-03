"use client";
import type { SduiGradient } from "../../types";
import { buildGradientCss } from "../../utils/valueToCss";

export interface GradientOverlayProps {
  gradient: SduiGradient;
  /** Height of the overlay as a 0-1 fraction of the container height. Defaults to 1 (full height). */
  heightPercent?: number;
  /** Width of the overlay as a 0-1 fraction of the container width. Defaults to 1 (full width). */
  widthPercent?: number;
}

/**
 * Renders an absolutely-positioned gradient overlay.
 * Uses `buildGradientCss` to convert the typed `SduiGradient` to a CSS string.
 */
export function GradientOverlay({
  gradient,
  heightPercent = 1,
  widthPercent = 1,
}: GradientOverlayProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="gradient-overlay"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: `${widthPercent * 100}%`,
        height: `${heightPercent * 100}%`,
        background: buildGradientCss(gradient),
      }}
    />
  );
}
