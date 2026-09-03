import React from "react";
import { Text, TTypographyToken, TWebTextElement } from "@rbx/discovery-sdui-components";
import { TSduiCommonProps } from "../system/SduiTypes";

type TSduiTextProps = TSduiCommonProps & {
  text: string;
  textFontStyle?: TTypographyToken;
  textColor?: string;
  webTextElement?: TWebTextElement;
};

const SduiText = ({
  text,
  textFontStyle,
  textColor,
  webTextElement,
  sduiContext,
}: TSduiTextProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  return (
    <Text
      text={text}
      textFontStyle={textFontStyle ?? tokens.Typography.BodyMedium}
      textColor={textColor ?? tokens.Color.Content.Default}
      webTextElement={webTextElement}
    />
  );
};

export default SduiText;
