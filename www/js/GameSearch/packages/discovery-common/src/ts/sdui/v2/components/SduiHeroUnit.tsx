"use client";

import React, { useMemo } from "react";
import { HeroUnit, OverlayPill, type TGradient } from "@rbx/discovery-sdui-components";
import { SduiImage } from "@rbx/sdui-client";
import type { SduiGradient, SduiRendererInjectedProps, SduiResolvedAction } from "@rbx/sdui-core";

export interface SduiHeroUnitProps extends SduiRendererInjectedProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  backgroundComponent?: React.ReactNode;
  bottomRowComponent?: React.ReactNode;
  ctaButtonComponent?: React.ReactNode;
  overlayComponent?: React.ReactNode;
  backgroundImage?: string;
  foregroundImage?: string;
  titleImage?: string;
  gradient?: SduiGradient;
  onActivated?: SduiResolvedAction;
  gradientHeightPercent?: number;
  gradientWidthPercent?: number;
  titleImageAspectRatio?: number;
  titleImageHeightPercentage?: number;
  minCardHeight?: number;
  foregroundAspectRatio?: number;
  enableBackgroundAnimation?: boolean;
  enableForegroundAnimation?: boolean;
}

const FULL_SIZE = {
  xScale: 1,
  xOffset: 0,
  yScale: 1,
  yOffset: 0,
};

const DEFAULT_GRADIENT: SduiGradient = {
  startColor: "#000000",
  endColor: "#000000",
  startOpacity: 0,
  endOpacity: 1,
  degree: 270,
  midpointPercent: 0.5,
};

function toHeroUnitGradient(gradient: SduiGradient): TGradient {
  return {
    startColor: gradient.startColor,
    endColor: gradient.endColor,
    // Proto startOpacity/endOpacity carry UIGradient Transparency values (1 = transparent), matching V1 and Lua.
    startTransparency: gradient.startOpacity,
    endTransparency: gradient.endOpacity,
    degree: gradient.degree,
    midpointPercent: gradient.midpointPercent,
  };
}

function buildHeroImage(image: string | undefined, alt: string, scaleType: "crop" | "fit") {
  if (!image) return null;

  return <SduiImage image={image} size={FULL_SIZE} scaleType={scaleType} alt={alt} />;
}

export function SduiHeroUnit({
  title = "",
  subtitle = "",
  badgeText,
  backgroundComponent,
  bottomRowComponent,
  ctaButtonComponent,
  overlayComponent,
  backgroundImage,
  foregroundImage,
  titleImage,
  gradient = DEFAULT_GRADIENT,
  onActivated,
  gradientHeightPercent,
  gradientWidthPercent,
  titleImageAspectRatio,
  titleImageHeightPercentage,
  minCardHeight,
  foregroundAspectRatio,
  enableBackgroundAnimation,
  enableForegroundAnimation,
}: SduiHeroUnitProps): React.JSX.Element {
  const resolvedGradient = useMemo(() => toHeroUnitGradient(gradient), [gradient]);
  const isVerticalGradient = gradient.degree === 0 || gradient.degree === 180;
  const finalGradientHeightPercent = gradientHeightPercent ?? (isVerticalGradient ? 1 : 0.5);
  const finalGradientWidthPercent = gradientWidthPercent ?? (isVerticalGradient ? 0.5 : 1);
  const resolvedOverlay =
    overlayComponent ?? (badgeText ? <OverlayPill pillText={badgeText} /> : null);
  const resolvedBottomRow = bottomRowComponent ?? ctaButtonComponent;

  return (
    <HeroUnit
      title={title}
      subtitle={subtitle}
      titleImageComponent={buildHeroImage(titleImage, title || subtitle, "fit")}
      foregroundImageComponent={buildHeroImage(foregroundImage, title, "fit")}
      backgroundImageComponent={
        backgroundComponent ?? buildHeroImage(backgroundImage, title, "crop")
      }
      gradient={resolvedGradient}
      gradientHeightPercent={finalGradientHeightPercent}
      gradientWidthPercent={finalGradientWidthPercent}
      backgroundClickAction={onActivated?.onActivated}
      backgroundClickLinkPath={onActivated?.href}
      bottomRowComponent={resolvedBottomRow}
      overlayPillComponent={resolvedOverlay}
      titleImageAspectRatio={titleImageAspectRatio}
      titleImageHeightPercentage={titleImageHeightPercentage}
      minCardHeight={minCardHeight}
      foregroundAspectRatio={foregroundAspectRatio}
      enableBackgroundAnimation={enableBackgroundAnimation}
      enableForegroundAnimation={enableForegroundAnimation}
    />
  );
}

export default SduiHeroUnit;
