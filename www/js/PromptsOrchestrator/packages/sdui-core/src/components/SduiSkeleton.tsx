"use client";
import React from "react";
import { clsx } from "clsx";
import { buildFoundationRadiusClass, type FoundationRadius } from "../utils/foundationToCss";
import { buildPositionAndAnchorPointCss, buildSizeCss } from "../utils/valueToCss";
import type { SduiDim2, SduiRendererInjectedProps, SduiVector2 } from "../types";
import "./sduiSkeleton.css";

export type SduiSkeletonProps = SduiRendererInjectedProps & {
  radius?: FoundationRadius;
  size?: SduiDim2;
  anchorPoint?: SduiVector2;
  position?: SduiDim2;
  visible?: boolean;
  zIndex?: number;
  testId?: string;
};

const fillStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: "100%",
};

/**
 * Web `SduiSkeleton` — shimmer loading panel aligned with lua `SduiSkeleton` /
 * `SkeletonSchema`. Fills its parent by default; pair with `SduiPlaceholderWrapper`
 * (`mountRealDuringPlaceholder`) so hidden real content defines the box size.
 */
export function SduiSkeleton({
  radius,
  size,
  anchorPoint,
  position,
  visible = true,
  zIndex,
  testId,
}: SduiSkeletonProps): React.JSX.Element | null {
  const layoutStyle = buildPositionAndAnchorPointCss(position, anchorPoint);
  const sizeStyle = buildSizeCss(size);
  const hasExplicitSize = sizeStyle.width != null || sizeStyle.height != null;

  if (!visible) {
    return null;
  }

  return (
    <div
      data-testid={testId ?? "sdui-skeleton"}
      className={clsx("sdui-skeleton-bar bg-surface-200", buildFoundationRadiusClass(radius))}
      style={{
        ...(hasExplicitSize ? sizeStyle : fillStyle),
        ...layoutStyle,
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
}

export default SduiSkeleton;
