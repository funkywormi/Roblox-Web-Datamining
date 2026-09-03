import React, { useMemo } from "react";
import {
  TextIconRow,
  TGuiObjectProps,
  TTypographyToken,
  TWebTextElement,
} from "@rbx/discovery-sdui-components";
import { TSduiCommonProps } from "../system/SduiTypes";
import { TSduiParsedAction } from "../system/SduiActionParserRegistry";

type TSduiTextIconRowProps = {
  // Called when component (text or icon) is activated
  onActivated?: TSduiParsedAction;

  // Text to render (required)
  text: string;
  // Text color. Defaults to Color.Content.Emphasis
  textColor?: string;
  // Font styles (Font, LetterSpacing, FontFamily, FontWeight, FontSize, and
  // LineHeight). Defaults to Typography.HeadingSmall
  fontStyle?: TTypographyToken;
  // Web text element to render. Defaults to span
  webTextElement?: TWebTextElement;

  // Gap between text and icon. Has no effect if icon is not provided. Defaults
  // to no gap
  gap?: number;

  // Class name of icon to render (optional)
  icon?: string;
  // Width and height of icon
  iconWidth?: number;
  // Color of icon
  iconColor?: string;
  // If true, the icon is rendered to the left of the text in the inline flex
  // box. Text is first by default
  iconFirst?: boolean;

  // Optional overrides on the text element
  textOverrides?: TGuiObjectProps;
  // Optional overrides on the icon element
  iconOverrides?: TGuiObjectProps;
} & TGuiObjectProps &
  TSduiCommonProps;

const SduiTextIconRow = ({
  layoutOrder,
  anchorPoint,
  automaticSize,
  size,
  position,
  zIndex,

  onActivated,

  text,
  textColor,
  fontStyle,
  webTextElement,

  gap,

  icon,
  iconWidth,
  iconColor,
  iconFirst,

  textOverrides,
  iconOverrides,

  sduiContext,
}: TSduiTextIconRowProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  const containerOverrides: TGuiObjectProps = useMemo(() => {
    return {
      layoutOrder,
      anchorPoint,
      automaticSize,
      size,
      position,
      zIndex,
    };
  }, [layoutOrder, anchorPoint, automaticSize, size, position, zIndex]);

  return (
    <TextIconRow
      onActivated={onActivated?.onActivated}
      linkPath={onActivated?.linkPath}
      text={text}
      textColor={textColor ?? tokens.Color.Content.Emphasis}
      fontStyle={fontStyle ?? tokens.Typography.HeadingSmall}
      webTextElement={webTextElement}
      gap={gap}
      iconClassName={icon}
      iconWidth={iconWidth}
      iconColor={iconColor}
      iconFirst={iconFirst}
      containerOverrides={containerOverrides}
      textOverrides={textOverrides}
      iconOverrides={iconOverrides}
    />
  );
};

export default SduiTextIconRow;
