"use client";
import React from "react";
import type { SduiGradient, SduiRendererInjectedProps, SduiTokenOrLiteral } from "../../types";
import { GradientOverlay } from "../primitives/GradientOverlay";
import { getPageHeaderStyles } from "./pageHeaderStyleUtils";

export interface SduiPageHeaderProps extends SduiRendererInjectedProps {
  backgroundComponent?: React.ReactNode;
  foregroundComponent?: React.ReactNode;
  gradient?: SduiGradient;
  gradientHeightPercent?: number;
  gradientWidthPercent?: number;
  backgroundMaxWidth?: SduiTokenOrLiteral;
  foregroundMaxWidth?: SduiTokenOrLiteral;
  foregroundHorizontalPadding?: SduiTokenOrLiteral;
  foregroundBottomPadding?: SduiTokenOrLiteral;
  foregroundFill?: boolean;
  foregroundTopPadding?: SduiTokenOrLiteral;
}

/**
 * Isomorphic page-header layout. Renders a background layer with an optional
 * gradient overlay and an absolutely-positioned foreground content layer.
 */
export function SduiPageHeader({
  backgroundComponent,
  foregroundComponent,
  gradient,
  gradientHeightPercent,
  gradientWidthPercent,
  backgroundMaxWidth,
  foregroundMaxWidth,
  foregroundHorizontalPadding,
  foregroundBottomPadding,
  foregroundFill,
  foregroundTopPadding,
}: SduiPageHeaderProps) {
  const { containerStyles, backgroundStyles, foregroundStyles, foregroundContentStyles } =
    getPageHeaderStyles({
      backgroundMaxWidth,
      foregroundMaxWidth,
      foregroundHorizontalPadding,
      foregroundBottomPadding,
      foregroundFill,
      foregroundTopPadding,
    });

  return (
    <div {...containerStyles}>
      <div data-testid="sdui-page-header-background" {...backgroundStyles}>
        {backgroundComponent}
        {gradient && (
          <GradientOverlay
            gradient={gradient}
            heightPercent={gradientHeightPercent}
            widthPercent={gradientWidthPercent}
          />
        )}
      </div>
      {foregroundComponent != null && (
        <div data-testid="sdui-page-header-foreground" {...foregroundStyles}>
          <div data-testid="sdui-page-header-foreground-content" {...foregroundContentStyles}>
            {foregroundComponent}
          </div>
        </div>
      )}
    </div>
  );
}
