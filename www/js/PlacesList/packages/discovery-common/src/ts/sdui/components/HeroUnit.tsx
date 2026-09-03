import React, { useMemo } from "react";
import {
  AttributionRow,
  HeroUnit as HeroUnitContainer,
  OverlayPill,
  TGradient,
} from "@rbx/discovery-sdui-components";
import { THeroUnitAsset, TSduiCommonProps } from "../system/SduiTypes";
import { TSduiParsedAction } from "../system/SduiActionParserRegistry";

type THeroUnitProps = {
  title: string;
  subtitle: string;

  bottomRowComponent?: { string: React.ReactNode };

  gradient: TGradient;

  gradientHeightPercent?: number;
  gradientWidthPercent?: number;

  // Component containing the foreground image
  foregroundImage: JSX.Element | null;

  // Component containing the background image
  backgroundImage: JSX.Element | null;

  // Component containing the title image
  titleImage?: JSX.Element | null;

  onActivated?: TSduiParsedAction;

  badgeText?: string;

  asset?: THeroUnitAsset;

  ctaButtonComponent?: React.ReactNode;

  titleImageAspectRatio?: number;
  titleImageHeightPercentage?: number;
  minCardHeight?: number;

  foregroundAspectRatio?: number;

  enableBackgroundAnimation?: boolean;
  enableForegroundAnimation?: boolean;

  /**
  TODO https://roblox.atlassian.net/browse/CLIGROW-2197:
  Add additional supported props to match App

  aspectRatio?: number;
  backgroundImageFrameHeight?: number;
  cornerRadius?: number;
  hideSubtitle?: boolean;
  foregroundOverflow?: number;
  backgroundOverflow?: number;

  contentPadding?: number;
  */
} & TSduiCommonProps & {
    children: React.ReactNode[];
  };

const HeroUnit = ({
  sduiContext,
  title,
  subtitle,
  titleImage,
  bottomRowComponent,
  gradient,
  gradientHeightPercent,
  gradientWidthPercent,
  foregroundImage,
  backgroundImage,
  onActivated,
  badgeText,
  asset,
  ctaButtonComponent,
  titleImageAspectRatio,
  titleImageHeightPercentage,
  minCardHeight,
  foregroundAspectRatio,
  enableBackgroundAnimation,
  enableForegroundAnimation,
  children,
}: THeroUnitProps): JSX.Element => {
  const attributionRow = useMemo(() => {
    const { tokens } = sduiContext.dependencies;
    if (asset) {
      return (
        <AttributionRow
          title={asset.title}
          titleFontStyle={tokens.Typography.TitleMedium}
          subtitle={asset.subtitle}
          subtitleFontStyle={tokens.Typography.BodyMedium}
          imageComponent={asset.image}
          rightButtonContent={ctaButtonComponent}
          subtitleMaxLines={1}
          textColor="white"
          height={40}
        />
      );
    }

    return <React.Fragment />;
  }, [asset, ctaButtonComponent, sduiContext]);

  const overlayComponent = useMemo(() => {
    if (badgeText) {
      return <OverlayPill pillText={badgeText} />;
    }

    return <React.Fragment />;
  }, [badgeText]);

  const finalGradientHeightPercent = useMemo(() => {
    if (gradientHeightPercent !== undefined) {
      return gradientHeightPercent;
    }
    if (gradient.degree === 0 || gradient.degree === 180) {
      return 1;
    }
    return 0.5;
  }, [gradientHeightPercent, gradient]);

  const finalGradientWidthPercent = useMemo(() => {
    if (gradientWidthPercent !== undefined) {
      return gradientWidthPercent;
    }
    if (gradient.degree === 0 || gradient.degree === 180) {
      return 0.5;
    }
    return 1;
  }, [gradientWidthPercent, gradient]);

  const heroUnit = useMemo(() => {
    return (
      <HeroUnitContainer
        title={title}
        subtitle={subtitle}
        titleImageComponent={titleImage}
        foregroundImageComponent={foregroundImage}
        backgroundImageComponent={backgroundImage}
        gradient={{
          ...gradient,
          heightPercent: finalGradientHeightPercent,
          widthPercent: finalGradientWidthPercent,
        }}
        gradientHeightPercent={finalGradientHeightPercent}
        gradientWidthPercent={finalGradientWidthPercent}
        overlayPillComponent={overlayComponent}
        backgroundClickAction={onActivated?.onActivated}
        backgroundClickLinkPath={onActivated?.linkPath}
        bottomRowComponent={bottomRowComponent ?? attributionRow}
        titleImageAspectRatio={titleImageAspectRatio}
        titleImageHeightPercentage={titleImageHeightPercentage}
        minCardHeight={minCardHeight}
        foregroundAspectRatio={foregroundAspectRatio}
        enableBackgroundAnimation={enableBackgroundAnimation}
        enableForegroundAnimation={enableForegroundAnimation}
      >
        {children}
      </HeroUnitContainer>
    );
  }, [
    backgroundImage,
    onActivated,
    bottomRowComponent,
    attributionRow,
    foregroundImage,
    gradient,
    finalGradientHeightPercent,
    finalGradientWidthPercent,
    subtitle,
    title,
    titleImage,
    children,
    overlayComponent,
    titleImageAspectRatio,
    titleImageHeightPercentage,
    minCardHeight,
    foregroundAspectRatio,
    enableBackgroundAnimation,
    enableForegroundAnimation,
  ]);

  return heroUnit;
};

export default HeroUnit;
