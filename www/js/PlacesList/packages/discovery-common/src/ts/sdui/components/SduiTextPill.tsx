import React, { useMemo } from "react";
import { TextPill, TGuiObjectProps, TTypographyToken } from "@rbx/discovery-sdui-components";
import { TSduiCommonProps } from "../system/SduiTypes";

type TSduiTextPillProps = {
  text?: string;
  textColor?: string;
  fontStyle?: TTypographyToken;
  backgroundColor?: string;
  backgroundTransparency?: number;
} & TGuiObjectProps &
  TSduiCommonProps;

const SduiTextPill = ({
  layoutOrder,
  anchorPoint,
  automaticSize,
  size,
  position,
  zIndex,

  text,
  textColor,
  fontStyle,
  backgroundColor,
  backgroundTransparency,

  sduiContext,
}: TSduiTextPillProps): JSX.Element => {
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

  if (!text) {
    return <React.Fragment />;
  }

  return (
    <TextPill
      text={text}
      textColor={textColor ?? tokens.LightMode.Content.Emphasis}
      fontStyle={fontStyle ?? tokens.Typography.LabelSmall}
      backgroundColor={backgroundColor ?? tokens.Color.Extended.White.White_100}
      backgroundTransparency={backgroundTransparency ?? 0}
      verticalPadding={tokens.Padding.XSmall}
      horizontalPadding={tokens.Padding.Small}
      containerOverrides={containerOverrides}
    />
  );
};

export default SduiTextPill;
