/** CSS conversion utilities for parsed SDUI prop types. */
import type { CSSProperties } from "react";
import {
  type SduiAutomaticSize,
  type SduiDim,
  type SduiDim2,
  type SduiGradient,
  type SduiScaleBasis,
  type SduiScaleType,
  type SduiVector2,
} from "../types";
import { buildFoundationColorCssVar } from "./foundationToCss";

type CssObjectFit = NonNullable<CSSProperties["objectFit"]>;

/**
 * Maps a parsed `SduiScaleType` to a CSS `object-fit` value.
 * `slice` and `tile` have no CSS equivalent and fall back to `fallbackObjectFit`.
 */
export function buildObjectFitCss(
  scaleType: SduiScaleType,
  fallbackObjectFit: CssObjectFit = "cover",
): CssObjectFit {
  switch (scaleType) {
    case "stretch":
      return "fill";
    case "fit":
      return "contain";
    case "crop":
      return "cover";
    case "slice":
    case "tile":
      // No CSS equivalent; fall back to the caller's default object-fit.
      return fallbackObjectFit;
  }
}

/**
 * Applies an opacity (0–1) to an already-normalised CSS color string.
 * Handles `#rrggbb`, `#rrggbbaa`, `rgb(r, g, b)`, Foundation token paths, and CSS `var()` references.
 */
function cssColorWithAlpha(cssColor: string, opacity: number): string {
  // Resolve Foundation token paths (e.g. "Color.Surface.Surface_0") to CSS var() references.
  const resolved = buildFoundationColorCssVar(cssColor) ?? cssColor;

  if (resolved.startsWith("var(")) {
    if (opacity === 1) return resolved;
    return `color-mix(in srgb, ${resolved} ${(opacity * 100).toFixed(1)}%, transparent)`;
  }

  const alpha = opacity.toFixed(3);
  if (/^#[0-9a-fA-F]{6}$/.test(resolved)) {
    const r = parseInt(resolved.slice(1, 3), 16);
    const g = parseInt(resolved.slice(3, 5), 16);
    const b = parseInt(resolved.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (/^#[0-9a-fA-F]{8}$/.test(resolved)) {
    const r = parseInt(resolved.slice(1, 3), 16);
    const g = parseInt(resolved.slice(3, 5), 16);
    const b = parseInt(resolved.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (resolved.startsWith("rgb(") && resolved.endsWith(")")) {
    return `rgba(${resolved.slice(4, -1)}, ${alpha})`;
  }
  return resolved;
}

/**
 * Converts a `SduiGradient` to a CSS `linear-gradient(...)` string.
 * The degree is converted from Roblox convention (add 90°) to CSS convention.
 */
export function buildGradientCss(gradient?: SduiGradient): string | undefined {
  if (gradient == null) return undefined;

  const cssDegree = (gradient.degree + 90) % 360;
  const startRgba = cssColorWithAlpha(gradient.startColor, gradient.startOpacity);
  const endRgba = cssColorWithAlpha(gradient.endColor, gradient.endOpacity);
  return `linear-gradient(${cssDegree}deg, ${startRgba}, ${gradient.midpointPercent * 100}%, ${endRgba})`;
}

/** CSS length unit used when resolving UDim scale. */
type ScaleCssUnit = "%" | "dvh" | "dvw";

/**
 * Converts a single dimension (scale + offset) to a CSS length string.
 * `unit` is the scale basis (`%` parent, `dvh`/`dvw` viewport). Offset-only
 * sizes stay in `px` regardless of unit.
 */
function buildSingleDimCss(scale: number, offset: number, unit: ScaleCssUnit = "%"): string {
  if (scale === 0) return `${offset}px`;
  if (offset === 0) return `${scale * 100}${unit}`;
  return `calc(${scale * 100}${unit} + ${offset}px)`;
}

/** Converts a parsed `SduiDim` to a CSS width/height length string. */
export function buildDimCss(dim?: SduiDim): string | undefined {
  if (dim == null) return undefined;
  return buildSingleDimCss(dim.scale, dim.offset);
}

export interface BuildSizeCssOptions {
  /** What `yScale` resolves against. `"parent"` (default) → `%`; `"viewport"` → `dvh`. */
  yScaleBasis?: SduiScaleBasis;
}

function yScaleCssUnit(yScaleBasis?: SduiScaleBasis): ScaleCssUnit {
  return yScaleBasis === "viewport" ? "dvh" : "%";
}

/**
 * Converts `SduiDim2` size and `SduiAutomaticSize` overrides to CSS width/height.
 * Browser defaults are already auto, so automatic-size only removes dimensions
 * that an explicit size would otherwise set.
 */
export function buildSizeCss(
  dim2?: SduiDim2,
  automaticSize?: SduiAutomaticSize,
  options?: BuildSizeCssOptions,
): { width?: string; height?: string } {
  if (dim2 == null) return {};

  const yUnit = yScaleCssUnit(options?.yScaleBasis);

  return {
    ...(automaticSize !== "x" && automaticSize !== "xy"
      ? { width: buildSingleDimCss(dim2.xScale, dim2.xOffset) }
      : {}),
    ...(automaticSize !== "y" && automaticSize !== "xy"
      ? { height: buildSingleDimCss(dim2.yScale, dim2.yOffset, yUnit) }
      : {}),
  };
}

/**
 * Converts `SduiDim2` (position) and `SduiVector2` (anchor point) for placement: position moves the element's
 * top-left corner, then translate shifts it so the requested anchor lands there.
 */
export function buildPositionAndAnchorPointCss(
  position?: SduiDim2,
  anchorPoint?: SduiVector2,
): {
  position?: "absolute";
  left?: string;
  top?: string;
  transformOrigin?: string;
  transform?: string;
} {
  // defaults for anchor point
  const anchorX = anchorPoint?.x ?? 0;
  const anchorY = anchorPoint?.y ?? 0;

  return {
    ...(position != null
      ? {
          position: "absolute",
          left: buildSingleDimCss(position.xScale, position.xOffset),
          top: buildSingleDimCss(position.yScale, position.yOffset),
          transform: `translate(-${anchorX * 100}%, -${anchorY * 100}%)`,
        }
      : {}),
    transformOrigin: `${anchorX * 100}% ${anchorY * 100}%`,
  };
}
