import React from "react";
import { TileFooter, TTypographyToken, TWebTextElement } from "@rbx/discovery-sdui-components";
import { TSduiCommonProps } from "../system/SduiTypes";
import { TSduiParsedAction } from "../system/SduiActionParserRegistry";

type SduiTileFooterProps = {
  // Parsed action config when the tile footer is activated
  onActivated?: TSduiParsedAction;

  textColor?: string;
  fontStyle?: TTypographyToken;

  // Gap between the text and the icon (for each section)
  textIconGap?: number;
  // Gap between the left and right sections
  sectionGap?: number;

  leftText?: string;
  leftIcon?: string;
  // Optional component to override the leftIcon
  leftIconComponent?: React.ReactNode;

  rightText?: string;
  rightIcon?: string;
  // Optional component to override the rightIcon
  rightIconComponent?: React.ReactNode;

  // Web text element to render for the left text
  leftWebTextElement?: TWebTextElement;
  // Web text element to render for the right text
  rightWebTextElement?: TWebTextElement;
} & TSduiCommonProps;

const SduiTileFooter = ({
  sduiContext,
  onActivated,
  textColor,
  fontStyle,
  textIconGap,
  sectionGap,
  leftText,
  leftIcon,
  leftIconComponent,
  rightText,
  rightIcon,
  rightIconComponent,
  leftWebTextElement,
  rightWebTextElement,
}: SduiTileFooterProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  return (
    <TileFooter
      onActivated={onActivated?.onActivated}
      linkPath={onActivated?.linkPath}
      textColor={textColor ?? tokens.Color.Content.Default}
      fontStyle={fontStyle ?? tokens.Typography.BodyMedium}
      textIconGap={textIconGap ?? tokens.Gap.XSmall}
      sectionGap={sectionGap ?? tokens.Gap.Small}
      // We only support the icons in _sduiIcons.scss, which are 16px, so this is non-configurable
      iconWidth={16}
      leftText={leftText ?? ""}
      leftIcon={leftIcon}
      leftIconComponent={leftIconComponent}
      rightText={rightText}
      rightIcon={rightIcon}
      rightIconComponent={rightIconComponent}
      leftWebTextElement={leftWebTextElement}
      rightWebTextElement={rightWebTextElement}
    />
  );
};

export default SduiTileFooter;
