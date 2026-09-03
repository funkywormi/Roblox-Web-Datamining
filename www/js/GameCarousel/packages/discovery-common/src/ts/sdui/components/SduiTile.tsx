import React from "react";
import { Tile, TTypographyToken, TWebTextElement } from "@rbx/discovery-sdui-components";
import { TSduiCommonProps } from "../system/SduiTypes";
import { TSduiParsedAction } from "../system/SduiActionParserRegistry";

export type TSduiTileProps = {
  // Optional focus state passed from the ConditionalPropsWrapper
  isFocused?: boolean;
  // Optional hover state passed from the ConditionalPropsWrapper
  isHovered?: boolean;

  // Image component parsed from the image string (i.e. rbxthumb)
  image?: JSX.Element | null;
  // Optional component to override the default image component, which is parsed from the image string
  imageComponent?: JSX.Element;

  imageAspectRatio?: number;
  thumbnailOverlayComponent?: JSX.Element;

  onActivated?: TSduiParsedAction;

  titleText?: string;
  titleColor?: string;
  titleFont?: TTypographyToken;
  titleLines?: number;
  // Optional component to override the default title component
  // Overrides titleText, titleColor, titleFont, and titleLines
  titleComponent?: JSX.Element;
  // Web text element to render for the title
  titleWebTextElement?: TWebTextElement;

  isContained?: boolean;
  containmentPadding?: number;
  cornerRadius?: number;

  footerComponent?: JSX.Element;
  ctaButtonComponent?: JSX.Element;

  // isOnScreen for tab behavior, passed from parent through local props
  isOnScreen?: boolean;
} & TSduiCommonProps;

const SduiTile = ({
  sduiContext,
  isFocused,
  isHovered,
  image,
  imageComponent,
  imageAspectRatio,
  thumbnailOverlayComponent,
  onActivated,
  titleText,
  titleColor,
  titleFont,
  titleLines,
  titleWebTextElement,
  titleComponent,
  isContained,
  containmentPadding,
  cornerRadius,
  footerComponent,
  ctaButtonComponent,
  isOnScreen,
}: TSduiTileProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  return (
    <Tile
      // If the tile is either focused or hovered, we show the focus state
      isFocused={(isFocused ?? false) || (isHovered ?? false)}
      imageComponent={imageComponent ?? image}
      imageAspectRatio={imageAspectRatio ?? 1}
      thumbnailOverlayComponent={thumbnailOverlayComponent}
      onActivated={onActivated?.onActivated}
      linkPath={onActivated?.linkPath}
      isContained={isContained ?? false}
      containmentBackgroundColor={tokens.Color.Surface.Surface_100}
      containmentPadding={containmentPadding ?? tokens.Padding.Small}
      cornerRadius={cornerRadius ?? tokens.Radius.Medium}
      titleText={titleText}
      titleColor={titleColor ?? tokens.Color.Content.Emphasis}
      titleFont={titleFont ?? tokens.Typography.TitleMedium}
      titleLines={titleLines ?? 1}
      titleWebTextElement={titleWebTextElement}
      titleComponent={titleComponent}
      footerComponent={footerComponent}
      ctaButtonComponent={ctaButtonComponent}
      isOnScreen={isOnScreen ?? false}
      placeholderImageBackgroundColor={tokens.Color.Surface.Surface_300}
    />
  );
};

export default SduiTile;
